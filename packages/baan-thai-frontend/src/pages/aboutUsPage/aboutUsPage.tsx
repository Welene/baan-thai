import React from "react";
import './aboutUs.css';
import omOssBig from '../../assets/omOss-big.jpg';
import omOssSmall1 from '../../assets/omOss-small-1.jpg';
import omOssSmall2 from '../../assets/omOss-small-2.jpg';
import person from '../../assets/person.png';

interface TeamMember {
    name: string;
    image?: string;
    role: string;
}

export const AboutUsPage: React.FC = () => {
    const teamMembers: TeamMember[] = [
        {
            name: "Johan",
            role: "Restaurantchef",
            image: ""
        },
        {
            name: "Chen",
            role: "Kökschef",
            image: ""
        },
        {
            name: "Kevin",
            role: "Servitris",
            image: "",

        }
    ];

    return (
        <div className="aboutUs-page">
            <section className="hero-section">
                <h1 className="page-title__big">OM OSS</h1>
            </section>
            <section className="story-section">
                <h2 className="page-subtitle">VD:n budskap</h2>
                <p className="content-text">
                    Vår passion för att tillaga thailändska rätter med en touch av kärlek och med noggrant utvalda färska ingredienser gör oss unika. 
                    Kom och besök vår restaurang på Kyrkogatan 36 i Arvika eller beställ en takeaway för att njuta av en smakupplevelse utöver det vanliga. 
                    Vårt kök bjuder på en kulinarisk resa som lockar dina sinnen och lämnar dig med en minnesvärd erfarenhet.
                </p>
            </section>
            <section className="team-section">
                <h2 className="page-subtitle">Vår personal</h2>
                <aside className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div className="team-member" key={index}>
                            <img src={person} alt="" className="team-image" />
                            <h3 className="member-name">{member.name}</h3>
                            <span className="member-role">{member.role}</span>
                        </div>
                    ))}
                </aside>
            </section>
        </div>
    )
}