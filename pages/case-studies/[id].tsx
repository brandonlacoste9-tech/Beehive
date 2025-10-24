import CaseStudyPage, { CaseStudyProps } from '@/components/marketing/CaseStudyPage';
import { caseStudies } from '@/lib/content/pjAceContent';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

type CaseStudyRouteProps = {
  caseStudy: CaseStudyProps;
};

export default function CaseStudyRoute({ caseStudy }: CaseStudyRouteProps) {
  return (
    <>
      <Head>
        <title>{caseStudy.title} — PJ Ace x AdGenXAI</title>
        <meta name="description" content={`How PJ Ace shipped ${caseStudy.title} with AdGenXAI.`} />
      </Head>
      <main className="bg-slate-50 pb-24">
        <CaseStudyPage {...caseStudy} />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(caseStudies).map((id) => ({ params: { id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<CaseStudyRouteProps> = async ({ params }) => {
  const id = params?.id as string;
  const caseStudy = caseStudies[id];

  if (!caseStudy) {
    return { notFound: true };
  }

  return {
    props: {
      caseStudy,
    },
  };
};
