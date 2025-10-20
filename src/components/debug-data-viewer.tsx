"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugDataViewer({ data }: { data: any }) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebug(true)}
      >
        Show Debug Info
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm font-mono">
          <p><strong>Type:</strong> {typeof data}</p>
          <p><strong>Is Array:</strong> {Array.isArray(data).toString()}</p>
          <p><strong>Is null:</strong> {(data === null).toString()}</p>
          <p><strong>Is undefined:</strong> {(data === undefined).toString()}</p>
          {data && <p><strong>Constructor:</strong> {data.constructor?.name}</p>}
          <pre className="mt-4 max-h-96 overflow-auto rounded bg-muted p-4">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => setShowDebug(false)}
        >
          Hide Debug Info
        </Button>
      </CardContent>
    </Card>
  );
}
