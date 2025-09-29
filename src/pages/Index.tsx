import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/172fa20b-c0af-4051-bf86-5dbf96c94726';

const Index = () => {
  const [energy, setEnergy] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [canCollect, setCanCollect] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const fetchEnergyStatus = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      
      const data = await response.json();
      setEnergy(data.energy);
      setCanCollect(data.canCollect);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching energy status:', error);
      toast.error('Ошибка загрузки данных');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergyStatus();
  }, []);

  const getEnergy = async () => {
    setIsCollecting(true);
    
    try {
      const userId = getUserId();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnergy(data.energy);
        setCanCollect(false);
        toast.success('Энергия получена!', {
          description: '+3 единицы энергии добавлено',
        });
      } else {
        toast.info('Уже получено', {
          description: 'Возвращайтесь завтра за новой энергией',
        });
      }
    } catch (error) {
      console.error('Error collecting energy:', error);
      toast.error('Ошибка получения энергии');
    } finally {
      setIsCollecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Icon name="Loader2" size={48} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md overflow-hidden border-none shadow-2xl">
        <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 text-white">
          <div className="absolute top-4 right-4 opacity-20">
            <Icon name="Zap" size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Zap" size={24} />
              <span className="text-sm font-medium tracking-wider uppercase opacity-90">
                Счётчик энергии
              </span>
            </div>
            
            <div className="mt-6 mb-8">
              <div className="text-7xl font-bold tracking-tight mb-2">
                {energy}
              </div>
              <div className="text-blue-100 text-sm">
                единиц энергии собрано
              </div>
            </div>

            <Button
              onClick={getEnergy}
              disabled={!canCollect || isCollecting}
              className="w-full bg-white text-indigo-600 hover:bg-blue-50 font-semibold py-6 text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCollecting ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Получение...
                </span>
              ) : canCollect ? (
                <span className="flex items-center gap-2">
                  <Icon name="Zap" size={20} />
                  Получить энергию
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="Check" size={20} />
                  Получено сегодня
                </span>
              )}
            </Button>

            {!canCollect && (
              <div className="mt-4 text-center text-sm text-blue-100">
                Возвращайтесь завтра за новой порцией энергии ⚡
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;