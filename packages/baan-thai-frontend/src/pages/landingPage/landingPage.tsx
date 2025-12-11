import './landingPage.css';
import firstImage from '../../assets/start.png';
import secondImage from '../../assets/padthai.png';
import thirdImage from '../../assets/lunch.png';
import qrImage from '../../assets/qr.png';
import fourthImage from '../../assets/take-away.png';

export const LandingPage = () => {

  return (
    <section className="page-body landing-page">
      <section className="landing-container landing-container__first" style={{ backgroundImage: `url(${firstImage})` }}>
        <h1 className="landing-container__title-big-brown">
          EN SMAKUPPLEVELSE UTAN DESS LIKE
        </h1>
      </section>

      <section className="landing-container__wrapper">
        <section className="landing-container landing-container__second">
          <h2 className="landing-container__title">
            VÄLKOMMEN TILL BAAN THAIKÖK
          </h2>

          <article className="landing-container__second-down">
            <img src={secondImage} alt="pad thai bild" className='landing-container__image-second'/>
            <p className="landing-container__text-brown">
              Vår passion för att tillaga thailändska rätter med en touch av kärlek och med noggrant utvalda färska ingredienser gör oss unika.<br/><br/>
              Kom och besök vår restaurang på Kyrkogatan 36 i Arvika eller beställ en takeaway för att njuta av en smakupplevelse utöver det vanliga.<br/><br/>
              Vårt kök bjuder på en kulinarisk resa som lockar dina sinnen och lämnar dig med en minnesvärd erfarenhet.
            </p>
          </article>
        </section>

        <section className="landing-container landing-container__third">
          <article className="landing-container__third-left">
            <img src={thirdImage} alt="lunch" className='landing-container__image-third'/>
            <p className="landing-container__title-brown">
              EN SMAKFULL UPPLEVELSE
            </p>
          </article>
          <article className="landing-container__third-right">
            <h2 className="landing-container__title-fat-yellow">
              VÅR LUNCH
            </h2>
            <p className="landing-container__text-light-yellow">
              Ta en paus från vardagen och unna dig en resa till Bangkok mitt på dagen!
            </p>
            <h2 className="landing-container__title-fat-yellow">
              Måndag till Fredag 11:00 - 14:30
            </h2>
            <p className="landing-container__text-light-yellow">
              135 SEK / person<br/> 
              125 SEK / Pensionär<br/> 
              110 SEK / Ta med<br/> 
              129 SEK / Sushi<br/> 
              (inkl. dryck)
            </p>
          </article>
        </section>
        
        <section className="landing-container landing-container__fourth">
          <article className="landing-container__fourth-left">
            <p className="landing-container__title-brown">
              ONLINE BESTÄLLNING
            </p>
            <a href="">
              <img src={qrImage} alt="QR code" className='landing-container__image-qr'/>
            </a>
            <p className="landing-container__title-brown">
              Klicka eller scanna QR-koden<br/> 
              Eller ring oss:<br/> 
              0570-155 17 <br/> 
              076-019 91 79
            </p>
          </article>
          
          <article className="landing-container__fourth-right">
            <img src={fourthImage} alt="take away mat" className='landing-container__image-fourth'/>
          </article>
        </section>
      </section>
    </section>
  )
}   
 
export default LandingPage;