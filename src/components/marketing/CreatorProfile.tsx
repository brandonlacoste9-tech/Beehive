import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type CreatorProfileProps = {
  name: string;
  handle?: string;
  heroImageUrl: string;
  bio: string;
  highlights: { label: string; value: string }[];
  projects: Array<{
    id: string;
    title: string;
    date: string;
    thumbnail: string;
    views: string;
    tags: string[];
  }>;
  ctaPrimary: { text: string; href: string };
};

const highlightColors = ['bg-amber-100 text-amber-900', 'bg-teal-100 text-teal-900', 'bg-purple-100 text-purple-900'];

export function CreatorProfile({
  name,
  handle,
  heroImageUrl,
  bio,
  highlights,
  projects,
  ctaPrimary,
}: CreatorProfileProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.title.localeCompare(b.title));
  }, [projects]);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
          <Image
            src={heroImageUrl}
            alt={`${name} hero`}
            width={720}
            height={900}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{name}</h1>
          {handle ? (
            <p className="mt-1 text-slate-500">@{handle}</p>
          ) : null}
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{bio}</p>
        </div>
        <dl className="grid gap-3">
          {highlights.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${highlightColors[index % highlightColors.length]}`}
            >
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <Link
          href={ctaPrimary.href}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {ctaPrimary.text}
        </Link>
      </div>
      <div className="space-y-10">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Creator Showcase</p>
          <h2 className="text-4xl font-semibold text-slate-900">Featured Projects</h2>
          <p className="text-base text-slate-600">
            Click into any project to study the workflow, prompt engineering, and distribution strategy that powers PJ Ace&apos;s
            viral output. Hover previews reveal quick GIF loops pulled from Veo 3 cinematic takes.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {sortedProjects.map((project) => (
            <article
              key={project.id}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject((current) => (current === project.id ? null : current))}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={`${project.title} thumbnail`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition duration-300 ${hoveredProject === project.id ? 'scale-105' : ''}`}
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <header className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">{project.title}</h3>
                  <p className="text-sm text-slate-500">{project.date}</p>
                </header>
                <p className="text-sm font-medium text-slate-700">{project.views}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/case-studies/${project.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-amber-500"
                >
                  See workflow
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CreatorProfile;
