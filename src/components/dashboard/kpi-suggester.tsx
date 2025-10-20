"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { suggestKpiAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  industry: z
    .string()
    .min(2, { message: "Industry must be at least 2 characters." }),
});

type KpiSuggesterProps = {
  role: Role;
  children: ReactNode;
};

export function KpiSuggester({ role, children }: KpiSuggesterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: role,
      industry: "Technology",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setSuggestions([]);
    const result = await suggestKpiAction(values);
    setLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else if (result.data) {
      setSuggestions(result.data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI KPI Suggester</DialogTitle>
          <DialogDescription>
            Get KPI suggestions tailored to your role and industry.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Generate Suggestions
            </Button>
          </form>
        </Form>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Suggested KPIs:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((kpi, index) => (
                <Badge key={index} variant="secondary">
                  {kpi}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
