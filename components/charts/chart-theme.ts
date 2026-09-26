export const axisProps = {
  fontSize: 12,
  stroke: "var(--color-border)",
  tick: { fill: "var(--color-muted-foreground)" },
  tickLine: false,
} as const;

export const tooltipProps = {
  contentStyle: {
    backgroundColor: "var(--color-popover)",
    borderColor: "var(--color-border)",
    borderRadius: "0.5rem",
    color: "var(--color-popover-foreground)",
    fontSize: "0.875rem",
  },
  labelStyle: { color: "var(--color-popover-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--color-popover-foreground)" },
  cursor: { fill: "var(--color-muted)", stroke: "var(--color-border)" },
} as const;
