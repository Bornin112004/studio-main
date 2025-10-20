# KPI Data Template Guide

## Column Definitions

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| **id** | Yes | String | Unique identifier for the KPI | `mkt-1`, `eng-2` |
| **department** | Yes | String | Department name | `Marketing`, `Engineering`, `Testing` |
| **title** | Yes | String | KPI display name | `New Clients Reached` |
| **value** | Yes | String | Current KPI value | `950`, `$11.2M`, `3.5%` |
| **change** | No | String | Change amount with sign | `+10%`, `-12%`, `+5` |
| **changeType** | No | Enum | Type of change | `increase` or `decrease` |
| **status** | No | Enum | KPI health status | `on-track`, `at-risk`, `off-track` |
| **description** | No | String | Context description | `vs. previous month` |
| **icon** | No | String | Lucide icon name | `Users`, `TrendingUp`, `Bug` |
| **chartType** | No | Enum | Chart visualization type | `line` or `bar` |
| **trendData** | No | JSON Array | Historical data points | See below |
| **comments** | No | JSON Array | Discussion comments | See below |
| **roles** | No | Comma-separated | Who can see this KPI | `CEO,Manager,Employee` |

## JSON Field Formats

### trendData Format
```json
[
  {"month":"Jan","value":1100},
  {"month":"Feb","value":1050},
  {"month":"Mar","value":1000}
]
```

### comments Format
```json
[
  {
    "id":1,
    "author":"Alex G.",
    "text":"Need to investigate",
    "timestamp":"2h ago",
    "avatar":"https://picsum.photos/seed/1/32/32"
  }
]
```

## Tips

1. **JSON fields must use double quotes** inside the cell
2. **Leave JSON fields empty** `[]` if no data
3. **changeType** is auto-detected from `change` if not specified
4. **Use valid icon names** from [Lucide Icons](https://lucide.dev/icons/)
5. **Department names must match** exactly: `Marketing`, `Engineering`, `Testing`

## Google Sheets Setup

1. Copy the template to a new Google Sheet
2. Share the sheet with your Google account
3. Get the Spreadsheet ID from the URL
4. Use range like `Sheet1!A1:M10` (adjust M based on last column)
