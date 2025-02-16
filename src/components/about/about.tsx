import './about.scss';
import SectionHeader from '../SectionHeader/SectionHeader';


const About = () => {
  return (
    <section className="about">
      <div className="container">
        <SectionHeader number="02" title="About Me" variant="light"/>
        <p className="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed libero metus, vehicula sit amet orci at, consequat lobortis ex. Etiam fermentum lacinia viverra. Nam tristique iaculis tincidunt. Vestibulum pellentesque, quam et tempor blandit, nisl ligula dictum quam, ac dapibus ipsum felis eget tortor. Ut cursus rutrum lorem, vel laoreet felis convallis eu. Proin dapibus ligula a pretium rutrum. Donec eu molestie erat,
        </p>
      </div>
    </section>
  );
};

export default About;