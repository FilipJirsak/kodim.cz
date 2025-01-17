import { useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import Layout from '../../Layout';
import NotFoundPage from '../NotFoundPage';
import ForbiddenPage from '../ForbiddenPage';
import ChapterView from '../../ChapterView';
import Navbar from '../../Navbar';
import CourseBanner from '../../CourseBanner';
import { ServerContextValue, useData } from '../../AppContext';
import './styles.scss';

const fetchCourse = async (
  { cms, accessCheck }: ServerContextValue,
  courseLink: string,
) => cms.getRoot(accessCheck).find(courseLink).fetch();

const CoursePage = () => {
  const courseLink = useParams().courseLink!;

  const course = useData(
    (serverContext: ServerContextValue) => fetchCourse(serverContext, courseLink),
  );

  if (course.status === 'not-found') {
    return <NotFoundPage />;
  }

  if (course.status === 'forbidden') {
    return <ForbiddenPage />;
  }

  if (course.content.type === 'broken') {
    return <p>Broken</p>;
  }

  return (
    <Layout>
      <Helmet>
        <title>{course.title}</title>
        <meta
          name="description"
          content={course.content.lead}
        />
      </Helmet>
      <Navbar crumbs={course.crumbs} showBrand />
      <CourseBanner course={course} />

      <section className="container chapters-section">
        {course.content.chapters.map((chapter) => (
          <ChapterView key={chapter.link} chapterLink={chapter.link} />
        ))}
      </section>
    </Layout>
  );
};

export default CoursePage;
