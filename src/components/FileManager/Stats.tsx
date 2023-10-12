import { contractName, nodeBaseUrl } from "@/utils/connection";
import { FilesIcon, FoldersIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

type StatsRowTypes = {
  last_file_id: number;
  last_folder_id: number;
};

const Stats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsRowTypes>({
    last_file_id: 0,
    last_folder_id: 0,
  });

  const fetchStats = async () => {
    const apiUrl = `${nodeBaseUrl}v1/chain/get_table_rows`;

    const requestBody = {
      json: true,
      code: contractName,
      scope: contractName,
      table: "lastid",
      lower_bound: null,
      upper_bound: null,
      index_position: 1,
      key_type: "",
      limit: "100",
      reverse: false,
      show_payer: true,
    };

    try {
      setIsLoading(true);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        setStats(responseData.rows[0].data);
        setIsLoading(false);
      } else {
        console.error("Failed to fetch data");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contractName) {
      fetchStats();
    }
  }, [contractName]);

  return (
    <div className={"flex items-center justify-between gap-3 flex-col w-full"}>
      <div className="space-y-2 mr-auto">
        <h2 className="text-2xl font-semibold tracking-tight">Stats</h2>
      </div>
      <Separator className="mt-4 mb-0" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total folders created:
            </CardTitle>
            <FoldersIcon className="h-6 w-6 text-muted-foreground stroke-orange-500 dark:stroke-orange-300" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2Icon className="mr-2 h-8 w-8 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.last_folder_id}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total files uploaded:
            </CardTitle>
            <FilesIcon className="h-6 w-6 text-muted-foreground stroke-orange-500 dark:stroke-orange-300" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2Icon className="mr-2 h-8 w-8 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.last_file_id}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
