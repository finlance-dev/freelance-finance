import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { posts } from "./posts";

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | Finlance Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: [{ url: `https://finlance.co${post.coverImage}`, width: 1200, height: 630 }],
    },
  };
}

function renderInlineMarkup(text: string) {
  // Handle bold + internal links + external links
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <Link key={j} href={linkMatch[2]} className="text-primary hover:underline font-medium">
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}

function renderContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{line.slice(3)}</h2>;
    }
    if (line.startsWith("![")) {
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <figure key={i} className="my-8">
            <Image
              src={match[2]}
              alt={match[1]}
              width={800}
              height={400}
              className="rounded-xl border border-border w-full h-auto"
            />
            {match[1] && (
              <figcaption className="text-center text-sm text-muted mt-2">{match[1]}</figcaption>
            )}
          </figure>
        );
      }
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-semibold text-lg mt-6 mb-2">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-6 text-foreground/80 leading-relaxed list-disc">
          {renderInlineMarkup(line.slice(2))}
        </li>
      );
    }
    if (line.startsWith("| ")) return null;
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-foreground/80 leading-relaxed">
        {renderInlineMarkup(line)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const wordCount = post.content.replace(/[#*|\n\-\[\]()!/]/g, " ").trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 120));

  const allSlugs = Object.keys(posts);
  const relatedSlugs = allSlugs.filter((s) => s !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    image: `https://finlance.co${post.coverImage}`,
    author: { "@type": "Organization", name: "Finlance" },
    publisher: { "@type": "Organization", name: "Finlance", url: "https://finlance.co" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าหลัก", item: "https://finlance.co" },
      { "@type": "ListItem", position: 2, name: "บทความ", item: "https://finlance.co/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://finlance.co/blog/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Header */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold">Finlance</span>
          </Link>
          <Link href="/signup" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            เริ่มใช้ฟรี
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-foreground transition">หน้าหลัก</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition">บทความ</Link>
          <span>/</span>
          <span className="text-foreground truncate">{post.title}</span>
        </nav>

        {/* Cover Image */}
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={630}
          className="rounded-2xl border border-border w-full h-auto mb-8"
          priority
        />

        <article>
          <div className="flex items-center gap-3 text-sm text-muted mb-3">
            <time>
              {new Date(post.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              อ่าน {readingTime} นาที
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-8">{post.title}</h1>
          <div className="prose-like space-y-1">{renderContent(post.content)}</div>
        </article>

        {/* CTA */}
        <div className="mt-14 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">เริ่มจัดการเงินอย่างมืออาชีพ</h3>
          <p className="text-muted mb-4">Finlance ช่วยฟรีแลนซ์ติดตามรายได้ ประมาณภาษี และจัดการกระแสเงินสด</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            เริ่มใช้ฟรี <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Related Posts */}
        {relatedSlugs.length > 0 && (
          <div className="mt-14">
            <h3 className="text-lg font-bold mb-4">บทความที่เกี่ยวข้อง</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedSlugs.map((s) => (
                <Link
                  key={s}
                  href={`/blog/${s}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <Image
                    src={posts[s].coverImage}
                    alt={posts[s].title}
                    width={400}
                    height={210}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition line-clamp-2">{posts[s].title}</h4>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium mt-2">
                      อ่านต่อ <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> กลับไปหน้าบทความ
          </Link>
        </div>
      </main>
    </div>
  );
}
