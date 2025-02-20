import InfoCards from '../InfoCards/InfoCards';

const Blog = () => {
  const blogPosts = [
    {
      title: "Headless WordPress and Next.js: benefits and setup",
      description: "The world's most popular content management system, WordPress, has evolved past ......",
      image: "/images/Blog-sample-img.png",
      link: "/blog/headless-wordpress"
    },
    {
      title: "Headless WordPress and Next.js: benefits and setup",
      description: "The world's most popular content management system, WordPress, has evolved past ......",
      image: "/images/Blog-sample-img.png",
      link: "/blog/headless-wordpress-2"
    },
    {
      title: "Headless WordPress and Next.js: benefits and setup",
      description: "The world's most popular content management system, WordPress, has evolved past ......",
      image: "/images/Blog-sample-img.png",
      link: "/blog/headless-wordpress-3"
    }
  ];

  return (
    <InfoCards
      sectionNumber="03"
      sectionTitle="NOTEBOOK"
      columns={3}
      cards={blogPosts.map(post => ({
        ...post,
        variant: 'light' 
      }))}
    />
  );
};

export default Blog;