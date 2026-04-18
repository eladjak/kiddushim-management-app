import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

import kidushishiOfficialLogo from "/lovable-uploads/c53fe31c-08ad-433e-83bb-0046039b3fb9.png";
import tzoharShabbatLogo from "/lovable-uploads/f2c17f54-6797-468f-9aaf-dccb20f6dd77.png";
import mgdalHaemekLogo from "/lovable-uploads/3ba8cd58-060e-46f0-ac3a-13a1fe6000e6.png";
import orotYehudaLogo from "/lovable-uploads/7de3d1d1-e9ec-4b4b-9d03-6ffcebfd5724.png";
import motnimLogo from "/lovable-uploads/3a4b148f-6b74-4024-bd48-74b7f9376688.png";
import agafTarbutLogo from "/lovable-uploads/7af2f9ec-39b3-4f17-8d6a-8c30b1d2ba8a.png";

interface PartnerLink {
  href: string;
  logo: string;
  alt: string;
  label: string;
}

const PARTNER_LINKS: PartnerLink[] = [
  {
    href: "https://www.facebook.com/OrotYehudaMigdalHaemeq/?locale=he_IL",
    logo: orotYehudaLogo,
    alt: "גרעין תורני אורות יהודה",
    label: "גרעין תורני אורות יהודה",
  },
  {
    href: "https://www.matnasmh.org.il/",
    logo: motnimLogo,
    alt: 'מתנ"ס מגדל העמק',
    label: 'מתנ"ס מגדל העמק',
  },
  {
    href: "https://www.migdal-haemeq.muni.il/Pages/default.aspx",
    logo: mgdalHaemekLogo,
    alt: "עיריית מגדל העמק",
    label: "עיריית מגדל העמק",
  },
  {
    href: "https://www.gov.il/he/departments/Units/jewish-culture",
    logo: agafTarbutLogo,
    alt: "האגף לתרבות יהודית",
    label: "האגף לתרבות יהודית",
  },
];

export const PartnersSection = () => {
  const sectionRef = useAnimateOnScroll<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background animate-on-scroll">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          מי מאחורי הפרויקט?
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mx-auto mb-10" />

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <Card className="p-6 text-center bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-100 dark:border-border shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 animate-on-scroll stagger-1">
            <div className="mb-4">
              <a
                href="https://www.tzohar.org.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label="ארגון רבני צהר - אתר חיצוני"
              >
                <img
                  src={tzoharShabbatLogo}
                  alt="ארגון רבני צהר"
                  className="h-24 mx-auto mb-4 hover:scale-105 transition-transform duration-200"
                />
              </a>
            </div>
            <CardTitle className="mb-2">ארגון רבני צהר</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              ארגון רבני צהר תומך בפרויקט במסגרת הפעילות הקהילתית להנגשת שירותי הדת לכלל החברה.
              הארגון מספק ליווי רוחני ומקצועי ותמיכה כלכלית לפרויקט.
            </CardDescription>
          </Card>

          <Card className="p-6 text-center bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-gray-100 dark:border-border shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 animate-on-scroll stagger-2">
            <div className="mb-4">
              <a
                href="https://kidushishi.tzohar.org.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label="קידושישי מגדל העמק - אתר חיצוני"
              >
                <img
                  src={kidushishiOfficialLogo}
                  alt="קידושישי מגדל העמק"
                  className="h-24 mx-auto mb-4 hover:scale-105 transition-transform duration-200"
                />
              </a>
            </div>
            <CardTitle className="mb-2">הגרעין התורני מגדל העמק</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              הגרעין התורני במגדל העמק הוא השותף המקומי המוביל בפרויקט.
              הגרעין מספק ניהול שוטף, תמיכה לוגיסטית ומעורבות קהילתית עמוקה.
            </CardDescription>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">שותפים ותומכים</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {PARTNER_LINKS.map((partner, index) => (
              <a
                key={partner.href}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.label} - אתר חיצוני`}
                className={`flex flex-col items-center p-6 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-border shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group animate-on-scroll stagger-${index + 3}`}
              >
                <img
                  src={partner.logo}
                  alt={partner.alt}
                  className="h-16 w-auto mb-3 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">{partner.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
