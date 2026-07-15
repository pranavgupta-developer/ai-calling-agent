import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KnowledgeBaseStats } from "@/types/knowledge-base";
import { BookOpen, CheckCircle, Clock, FileText, Layers, XCircle } from "lucide-react";

interface KnowledgeStatsProps {
  stats: KnowledgeBaseStats;
}

export function KnowledgeStats({ stats }: KnowledgeStatsProps) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.custom} Custom · {stats.seed} Seed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {stats.inactive} Inactive entries
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Layers className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueCategories}</div>
          <p className="text-xs text-muted-foreground">
            Unique topics covered
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium line-clamp-1">
            {stats.recentlyUpdated.length > 0 ? stats.recentlyUpdated[0].question : "No updates yet"}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {stats.recentlyUpdated.length > 0 ? "Latest modified entry" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
