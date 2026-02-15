import { Card, CardTitle, CardDescription } from "@/components/ui/card";

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
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          מי מאחורי הפרויקט?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 text-center shadow-lg">
            <div className="mb-4">
              <a
                href="https://www.tzohar.org.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={tzoharShabbatLogo}
                  alt="ארגון רבני צהר"
                  className="h-24 mx-auto mb-4 hover:scale-105 transition-transform"
                />
              </a>
            </div>
            <CardTitle className="mb-2">ארגון רבני צהר</CardTitle>
            <CardDescription className="text-base">
              ארגון רבני צהר תומך בפרויקט במסגרת הפעילות הקהילתית להנגשת שירותי הדת לכלל החברה.
              הארגון מספק ליווי רוחני ומקצועי ותמיכה כלכלית לפרויקט.
            </CardDescription>
          </Card>

          <Card className="p-6 text-center shadow-lg">
            <div className="mb-4">
              <a
                href="https://kidushishi.tzohar.org.il/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={kidushishiOfficialLogo}
                  alt="קידושישי מגדל העמק"
                  className="h-24 mx-auto mb-4 hover:scale-105 transition-transform"
                />
              </a>
            </div>
            <CardTitle className="mb-2">הגרעין התורני מגדל העמק</CardTitle>
            <CardDescription className="text-base">
              הגרעין התורני במגדל העמק הוא השותף המקומי המוביל בפרויקט.
              הגרעין מספק ניהול שוטף, תמיכה לוגיסטית ומעורבות קהילתית עמוקה.
            </CardDescription>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-6">שותפים ותומכים</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {PARTNER_LINKS.map((partner) => (
              <a
                key={partner.href}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <img
                  src={partner.logo}
                  alt={partner.alt}
                  className="h-16 w-auto mb-2 object-contain"
                />
                <span className="text-sm text-gray-600 text-center">{partner.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
