import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Music, 
  Heart, 
  BookOpen, 
  Star,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Download,
  MessageCircle
} from "lucide-react";

// Import our beautiful images
import kidushishiGathering from "@/assets/kidushishi-gathering.jpg";
import kidushishiLogo from "@/assets/kidushishi-logo.png";
import familiesActivity from "@/assets/families-activity.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    family_size: "",
    children_ages: "",
    comments: ""
  });

  // Fetch upcoming events from our system
  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      // שמירת הרשמה במערכת + שליחת הודעות
      const registrationData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        family_size: parseInt(formData.family_size) || 1,
        children_ages: formData.children_ages,
        comments: formData.comments,
        registration_date: new Date().toISOString(),
        event_id: upcomingEvents?.[0]?.id || null // Link to next event if exists
      };

      const { error: dbError } = await supabase
        .from('event_registrations')
        .insert([registrationData]);

      if (dbError) throw dbError;

      // Send confirmation via edge function (will implement after getting Resend key)
      try {
        await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            registrationData,
            eventDetails: upcomingEvents?.[0] || null
          }
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
        // Don't fail the registration if email fails
      }

      toast({
        title: "נרשמת בהצלחה! 🎉",
        description: "תקבל הודעה עם פרטי האירוע הקרוב בהקדם",
      });

      setShowRegistration(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        family_size: "",
        children_ages: "",
        comments: ""
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהרשמה. נסה שוב או צור קשר",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (showRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <Button 
            variant="ghost" 
            onClick={() => setShowRegistration(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl">הרשמה לקידושישי מגדל העמק</CardTitle>
              <CardDescription className="text-blue-100">
                מלא את הפרטים ונשלח לך הזמנה לאירוע הקרוב
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <Label htmlFor="name">שם מלא *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    required
                    placeholder="השם שלך"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    required
                    placeholder="050-1234567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="family_size">כמה אנשים במשפחה?</Label>
                  <Input
                    id="family_size"
                    type="number"
                    min="1"
                    value={formData.family_size}
                    onChange={(e) => setFormData(prev => ({...prev, family_size: e.target.value}))}
                    placeholder="4"
                  />
                </div>
                
                <div>
                  <Label htmlFor="children_ages">גילאי ילדים (אם יש)</Label>
                  <Input
                    id="children_ages"
                    value={formData.children_ages}
                    onChange={(e) => setFormData(prev => ({...prev, children_ages: e.target.value}))}
                    placeholder="למשל: 5, 8, 12"
                  />
                </div>
                
                <div>
                  <Label htmlFor="comments">הערות או בקשות מיוחדות</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({...prev, comments: e.target.value}))}
                    placeholder="כל דבר שחשוב לנו לדעת..."
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                  disabled={isRegistering}
                >
                  {isRegistering ? "נרשם..." : "הרשם עכשיו 🎉"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Section - Enhanced with real image */}
      <section 
        className="relative py-20 px-4 text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url(${kidushishiGathering})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="mb-8">
            <img 
              src={kidushishiLogo}
              alt="קידושישי מגדל העמק" 
              className="h-24 mx-auto mb-4 drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            קידושישי מגדל העמק
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            חוויית קבלת שבת קהילתית ומאחדת <br/>
            למשפחות, ילדים ומבוגרים
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg transform hover:scale-105 transition-all"
              onClick={() => setShowRegistration(true)}
            >
              הרשמה לאירוע הבא 🌟
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-700 shadow-lg"
              onClick={() => navigate("/events")}
            >
              לוח אירועים
            </Button>
          </div>
        </div>
      </section>

      {/* מה זה קידושישי */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              מה זה קידושישי?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              מיזם קהילתי מיוחד המיועד ליצור מסורת של קבלות שבת משותפות ומאחדות במגדל העמק
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-3 text-xl">קהילה מאוחדת</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                חיבור בין כל חלקי האוכלוסיה במגדל העמק דרך חוויה משותפת של קדושת השבת
              </CardDescription>
            </Card>
            
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10 bg-cover bg-center"
                style={{ backgroundImage: `url(${familiesActivity})` }}
              ></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="mb-3 text-xl">מוזיקה ויצירה</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  אירועים עשירים בשירה, מוזיקה, פעילויות יצירה ולימוד משותף לכל המשפחה
                </CardDescription>
              </div>
            </Card>
            
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="mb-3 text-xl">חוויה משפחתית</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                פעילויות מותאמות לכל הגילאים, יצירת זיכרונות יפים ורגעי חיבור אמיתיים
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* פרטי האירועים */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                איך נראה אירוע קידושישי?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">משך האירוע</h3>
                    <p className="text-gray-600">כשעתיים של חוויה מלאה - מקבלת שבת ועד פעילויות משותפות</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">מיקומים מרכזיים</h3>
                    <p className="text-gray-600">פארקים ציבוריים ומרכזים קהילתיים נגישים במגדל העמק</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">תוכן מגוון</h3>
                    <p className="text-gray-600">שירה, לימוד, פעילויות יצירה לילדים ושיח קהילתי</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Enhanced event card with real data */}
              <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-8 rounded-2xl text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">
                  {eventsLoading ? "טוען אירוע..." : 
                   upcomingEvents && upcomingEvents.length > 0 ? 
                   "האירוע הבא" : "האירוע הבא בתכנון"}
                </h3>
                
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      <span>{new Date(upcomingEvents[0].date).toLocaleDateString('he-IL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <span>{upcomingEvents[0].location_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <span>מתאים לכל המשפחה</span>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Badge className="bg-white text-blue-700 px-4 py-2">
                        השתתפות ללא עלות
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white text-white hover:bg-white hover:text-blue-700"
                        onClick={() => {
                          // Generate calendar event
                          const event = upcomingEvents[0];
                          const eventDate = new Date(event.date);
                          const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
                          
                          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${encodeURIComponent(event.location_address || event.location_name)}&details=${encodeURIComponent(`קידושישי מגדל העמק - ${event.title}`)}`;
                          window.open(calendarUrl, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4 ml-1" />
                        הוסף ליומן
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      <span>האירוע הבא יפורסם בקרוב</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <span>מגדל העמק</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <span>מתאים לכל המשפחה</span>
                    </div>

                    <Badge className="mt-6 bg-white text-blue-700 px-4 py-2">
                      השתתפות ללא עלות
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* יוזמי הפרויקט */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            מי מאחורי הפרויקט?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="mb-2">ארגון צהר</CardTitle>
              <CardDescription className="text-base">
                ארגון רבני צהר תומך בפרויקט במסגרת הפעילות הקהילתית להנגשת שירותי הדת לכלל החברה
              </CardDescription>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="mb-2">הגרעין התורני מגדל העמק</CardTitle>
              <CardDescription className="text-base">
                הגרעין התורני במגדל העמק שותף מרכזי בהפעלה ובתמיכה הלוגיסטית של הפרויקט
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* יצירת קשר */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            נשמח לענות על שאלות ולקבל אותכם
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
            <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
              <Phone className="h-8 w-8" />
              <div>
                <p className="font-semibold">טלפון</p>
                <p className="text-lg">050-1234567</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
              <Mail className="h-8 w-8" />
              <div>
                <p className="font-semibold">אימייל</p>
                <p className="text-lg">kidushishi@example.com</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
              <MessageCircle className="h-8 w-8" />
              <div>
                <p className="font-semibold">וואטסאפ</p>
                <p className="text-lg">050-1234567</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-gray-100 shadow-lg px-8 py-4"
              onClick={() => setShowRegistration(true)}
            >
              הרשמה לאירוע הבא
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-gray-300 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="mb-4">
            © 2025 קידושישי מגדל העמק • פרויקט של ארגון צהר והגרעין התורני מגדל העמק
          </p>
          <div className="flex justify-center gap-6">
            <Button 
              variant="link" 
              className="text-gray-300 hover:text-white p-0"
              onClick={() => navigate("/auth")}
            >
              כניסה לצוות
            </Button>
            <Button 
              variant="link" 
              className="text-gray-300 hover:text-white p-0"
              onClick={() => navigate("/documentation")}
            >
              תיעוד הפרויקט
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;