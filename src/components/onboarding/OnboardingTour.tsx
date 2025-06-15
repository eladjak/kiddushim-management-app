
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, X, ExternalLink, Calendar, Users, FileText, Package2 } from "lucide-react";
import { Link } from "react-router-dom";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    type: 'navigate' | 'external';
    url: string;
    label: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "ברוכים הבאים לקידושישי",
    description: "מערכת ניהול האירועים והמתנדבים של הקהילה. כאן תוכלו לנהל את כל הפעילויות הקהילתיות בצורה מסודרת ויעילה.",
    icon: <Calendar className="h-8 w-8" />,
    action: {
      type: 'external',
      url: 'https://kidushishi.tzohar.org.il/',
      label: 'למידע נוסף על הפרויקט'
    }
  },
  {
    id: "events",
    title: "ניהול אירועים",
    description: "צפו באירועים הקרובים, הירשמו כמשתתפים או מתנדבים, וקבלו עדכונים על שינויים. מנהלים יכולים ליצור ולערוך אירועים חדשים.",
    icon: <Calendar className="h-8 w-8" />,
    action: {
      type: 'navigate',
      url: '/events',
      label: 'עבור לעמוד האירועים'
    }
  },
  {
    id: "volunteers",
    title: "מתנדבים וצוות",
    description: "רכזים יכולים לנהל את רשימת המתנדבים, להקצות תפקידים ולתאם פעילויות. צפו במי זמין ומתי.",
    icon: <Users className="h-8 w-8" />,
    action: {
      type: 'navigate',
      url: '/volunteers',
      label: 'עבור לניהול מתנדבים'
    }
  },
  {
    id: "reports",
    title: "דיווחים ומשובים",
    description: "צרו דיווחים לאחר אירועים, שתפו משובים ועקבו אחר התקדמות הפעילויות. מידע חשוב לשיפור מתמיד.",
    icon: <FileText className="h-8 w-8" />,
    action: {
      type: 'navigate',
      url: '/reports',
      label: 'עבור לדיווחים'
    }
  },
  {
    id: "equipment",
    title: "ניהול ציוד",
    description: "עקבו אחר הציוד הזמין, בקשו שינויים ותאמו שימוש בציוד לאירועים שונים.",
    icon: <Package2 className="h-8 w-8" />,
    action: {
      type: 'navigate',
      url: '/equipment',
      label: 'עבור לניהול ציוד'
    }
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-primary">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                שלב {currentStep + 1} מתוך {onboardingSteps.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
          
          {currentStepData.action && (
            <div className="border rounded-lg p-4 bg-secondary/20">
              {currentStepData.action.type === 'navigate' ? (
                <Link to={currentStepData.action.url}>
                  <Button variant="outline" className="w-full">
                    {currentStepData.action.label}
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                </Link>
              ) : (
                <a href={currentStepData.action.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    {currentStepData.action.label}
                    <ExternalLink className="h-4 w-4 mr-2" />
                  </Button>
                </a>
              )}
            </div>
          )}
          
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              קודם
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                דלג
              </Button>
              <Button onClick={handleNext}>
                {currentStep === onboardingSteps.length - 1 ? 'סיום' : 'הבא'}
                {currentStep < onboardingSteps.length - 1 && (
                  <ArrowLeft className="h-4 w-4 mr-2" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
