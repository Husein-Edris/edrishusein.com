import Image from 'next/image';
import './Hero.scss';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="profile-wrapper">
          <Image
            src="/EdrisHusein-Hero.png"
            alt="Edris Profile"
            width={450}
            height={450}
            className="profile-image"
            priority
          />
        </div>
        <div className="content">
          <h1 className="title">
            <span className="subTitle">I'm</span>EDRIS <span className="wave">👋</span>
          </h1>
          <p className="description">
           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed libero metus, vehicula sit amet orci at, consequat lobortis ex. Etiam fermentum lacinia viverra.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;