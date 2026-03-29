import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Link
            to="/#news"
            className="inline-flex items-center gap-2 text-primary font-heading font-semibold mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para notícias
          </Link>

          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                Notícia não encontrada
              </h2>
              <p className="text-muted-foreground">
                A notícia que você procura não existe ou foi removida.
              </p>
            </div>
          )}

          {news && (
            <article>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-8">
                {news.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={news.published_at}>
                      {format(new Date(news.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </time>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{news.author}</span>
                </div>
              </div>

              {news.image_url && (
                <div className="rounded-2xl overflow-hidden mb-8">
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              )}

              {news.summary && (
                <p className="font-body text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4">
                  {news.summary}
                </p>
              )}

              <div
                className="prose prose-lg max-w-none font-body text-foreground"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetail;
