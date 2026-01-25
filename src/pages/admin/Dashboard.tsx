import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Package, Users, Newspaper } from "lucide-react";

interface Stats {
  banners: number;
  products: number;
  partners: number;
  news: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    banners: 0,
    products: 0,
    partners: 0,
    news: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [bannersRes, productsRes, partnersRes, newsRes] = await Promise.all([
        supabase.from("banners").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
        supabase.from("news").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        banners: bannersRes.count ?? 0,
        products: productsRes.count ?? 0,
        partners: partnersRes.count ?? 0,
        news: newsRes.count ?? 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Banners",
      value: stats.banners,
      icon: Image,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Produtos",
      value: stats.products,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Parceiros",
      value: stats.partners,
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Notícias",
      value: stats.news,
      icon: Newspaper,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao painel administrativo da Renovar Agrobusiness
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>Use o menu lateral para navegar entre as seções de gerenciamento.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
