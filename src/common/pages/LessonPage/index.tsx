import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import Navbar from '../../Navbar';
import ArticleContent from '../../ArticleContent';
import LessonSectionView from '../../LessonSectionView';
import Layout from '../../Layout';
import { ServerContextValue, useData } from '../../AppContext';
import SideNavLink from '../../SideNavLink';
import LessonBanner from '../LessonBanner';
import NotFoundPage from '../NotFoundPage';
import ForbiddenPage from '../ForbiddenPage';
import { Lock } from '../../icons';
import './styles.scss';

const fetchLesson = async (
  { cms, accessCheck }: ServerContextValue,
  courseLink: string,
  chapterLink: string,
  lessonLink: string,
) => cms.getRoot(accessCheck)
  .find(courseLink)
  .find(chapterLink)
  .find(lessonLink)
  .fetch();

const LessonPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const lesson = useData(
    (serverContext: ServerContextValue) => fetchLesson(
      serverContext,
      params.courseLink!,
      params.chapterLink!,
      params.lessonLink!,
    ),
  );

  if (lesson.status === 'not-found') {
    return <NotFoundPage />;
  }

  if (lesson.status === 'forbidden') {
    return <ForbiddenPage />;
  }

  if (lesson.content.type === 'broken') {
    return <p>Špatný formát lekce</p>;
  }

  const activeSectionLink = params.sectionLink ?? lesson.content.sections[0]?.link;

  useEffect(() => {
    if (params.sectionLink === undefined) {
      navigate(activeSectionLink, { replace: true });
    }
  }, [params.sectionLink]);

  const articleNavigation = lesson.content.sections.map((secRef) => (
    <SideNavLink key={secRef.link} active={secRef.link === activeSectionLink}>
      {secRef.status === 'forbidden' ? (
        <>
          <Lock />
          {' '}
          {secRef.title}
        </>
      ) : (
        <a href={secRef.path}>{secRef.title}</a>
      )}
    </SideNavLink>
  ));

  const activeSectionTitle = lesson.content.sections.find(
    (secRef) => secRef.link === activeSectionLink,
  )?.title;

  return (
    <Layout>
      <Helmet>
        <title>
          {activeSectionTitle
            ? `${activeSectionTitle} | ${lesson.title}`
            : lesson.title}
        </title>
        <meta
          name="description"
          content={lesson.content.lead}
        />
      </Helmet>
      <Navbar crumbs={lesson.crumbs} showBrand />
      <LessonBanner lesson={lesson} />
      <ArticleContent navElement={articleNavigation}>
        { activeSectionLink === undefined ? (
          <p><strong>CHYBA: Tato lekce neobsahuje odkazy na žádné sekce!</strong></p>
        ) : <LessonSectionView sectionLink={activeSectionLink} />}
      </ArticleContent>
    </Layout>
  );
};

export default LessonPage;
