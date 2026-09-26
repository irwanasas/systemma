"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type PageTab = { value: string; label: string; content: React.ReactNode };

type PageTabsProps = {
  label: string;
  tabs: PageTab[];
  orientation?: "horizontal" | "vertical";
};

export const PageTabs = ({ label, tabs, orientation = "horizontal" }: PageTabsProps): React.ReactNode => {
  const isVertical = orientation === "vertical";
  return (
    <Tabs
      defaultValue={tabs[0]?.value}
      orientation="horizontal"
      className={cn("gap-5", isVertical && "lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-8")}
    >
      <div className={cn("-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", isVertical && "lg:sticky lg:top-20 lg:overflow-visible")}>
        <TabsList
          variant="line"
          aria-label={label}
          className={cn(
            "!h-auto w-max gap-1 border-b border-border p-0 sm:w-full sm:justify-start",
            isVertical && "lg:w-full lg:flex-col lg:items-stretch lg:border-b-0",
          )}
        >
          {tabs.map(({ value, label: tabLabel }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "min-h-11 flex-none rounded-none border-0 px-3 text-ui text-muted-foreground after:!bottom-[-1px] after:bg-primary hover:text-foreground data-[state=active]:font-semibold data-[state=active]:text-primary-strong",
                isVertical &&
                  "lg:justify-start lg:rounded-md lg:after:hidden lg:data-[state=active]:!bg-primary-soft",
              )}
            >
              {tabLabel}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value} className="flex flex-col gap-5">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
