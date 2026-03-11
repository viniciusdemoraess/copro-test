import { Button } from '@/components/ui/button';
import { usePublicSetting } from '@/hooks/useSiteSettings';
import { Instagram, Menu, Phone, Star, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  showAssociationForm?: boolean;
  onAssociateClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showAssociationForm = false,
  onAssociateClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { value: contactPhone } = usePublicSetting('contact_phone');
  const { value: showPortalCooperado } = usePublicSetting('show_portal_cooperado');
  const { value: portalCooperadoUrl } = usePublicSetting('portal_cooperado_url');

  const phoneNumber = contactPhone || '(65) 98448-2372';
  const phoneLink = `tel:+55${phoneNumber.replace(/\D/g, '')}`;
  const shouldShowPortal = showPortalCooperado === 'true';

  const isActive = (path: string) => location.pathname === path;

  const handlePortalClick = () => {
    if (portalCooperadoUrl) {
      window.open(portalCooperadoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    // Se estiver na página de Serviços, navega para home com hash
    if (location.pathname === '/servicos') {
      navigate(`/${hash}`);
      // Garante que o hash seja aplicado após a navegação
      setTimeout(() => {
        window.location.hash = hash;
      }, 0);
    } else {
      // Se já estiver na home, apenas faz scroll
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Se o elemento não existir ainda, navega com hash
        navigate(`/${hash}`);
      }
    }
  };

  return (
    <header className="bg-background">
      {/* Top Bar */}
      <nav className="bg-primary text-primary-foreground font-bold px-4 sm:px-6 lg:px-16 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Contact - Always visible */}
          <a href={phoneLink} className="flex items-center gap-1.5 text-xs sm:text-base lg:text-lg hover:opacity-80 transition-opacity flex-shrink-0">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">{phoneNumber}</span>
            <span className="sm:hidden">Ligar</span>
          </a>

          {/* Mobile: Botões na mesma linha */}
          <div className="md:hidden flex items-center gap-1.5 flex-1 min-w-0 justify-end">
            <Button
              onClick={() => navigate('/associacao')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] whitespace-nowrap flex-shrink-0"
            >
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              <span>Seja <span className="font-bold">Cooperado</span></span>
            </Button>

            {shouldShowPortal && (
              <Button
                onClick={handlePortalClick}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] whitespace-nowrap flex-shrink-0"
              >
                <img src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/a6afd4af73d88d857968f134bb7389082d339d5a?placeholderIfAbsent=true" className="w-3.5 h-3.5" alt="Portal icon" />
                <span className="hidden min-[375px]:inline">
                  Portal <span className="text-brand-yellow">Cooperado</span>
                </span>
                <span className="min-[375px]:hidden">Portal do Cooperado</span>
              </Button>
            )}

          </div>

          {/* Desktop Buttons + Social */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={() => navigate('/associacao')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm sm:text-base whitespace-nowrap transition-all duration-300 hover:scale-105"
            >
              <Star className="w-5 h-5" fill="currentColor" />
              <span>Seja <span className="font-bold">Cooperado</span></span>
            </Button>

            {shouldShowPortal && (
              <Button
                onClick={handlePortalClick}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm sm:text-base whitespace-nowrap"
              >
                <img src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/a6afd4af73d88d857968f134bb7389082d339d5a?placeholderIfAbsent=true" className="w-5 h-5" alt="Portal icon" />
                <span>
                  Portal do <span className="text-brand-yellow">Cooperado</span>
                </span>
              </Button>
            )}

            <a href="https://instagram.com/CooprosojaMT" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-[10px] whitespace-nowrap hover:opacity-80 transition-opacity">
              <Instagram className="w-7 h-7 mb-1" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Logo + Navigation */}
      <div className="bg-background px-4 sm:px-6 py-1 lg:px-[64px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="cursor-pointer">
            <img
              src="https://api.builder.io/api/v1/image/assets/9c78df31aec1499c9cacc7be38a6737d/1ece453c59a3fda6ba2166821c860e6bf97b0ab6?placeholderIfAbsent=true"
              className="w-56 sm:w-72 md:w-80 lg:w-96 h-auto"
              alt="Cooprosoja Logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-base md:text-lg lg:text-xl text-primary font-bold" role="navigation">
            <a
              href="#quem-somos"
              onClick={(e) => handleAnchorClick(e, '#quem-somos')}
              className="hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Quem Somos
            </a>
            {/* <a
              href="#linha-temporal"
              onClick={(e) => handleAnchorClick(e, '#linha-temporal')}
              className="hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Linha Temporal
            </a>*/}
            <a
              href="#podcast"
              onClick={(e) => handleAnchorClick(e, '#podcast')}
              className="hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Podcast
            </a>
            <a
              href="#beneficios-cooperados"
              onClick={(e) => handleAnchorClick(e, '#beneficios-cooperados')}
              className="hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Benefícios
            </a>
            <Link to="/servicos" className={`hover:text-primary/80 transition-colors whitespace-nowrap ${isActive('/servicos') ? 'text-accent' : ''}`}>
              Serviços
            </Link>
          </nav>

          {/* Mobile Navigation Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={mobileNavOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          >
            {mobileNavOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary/20 pt-4 space-y-3 animate-fade-in">
            <a
              href="#quem-somos"
              onClick={(e) => {
                handleAnchorClick(e, '#quem-somos');
                setMobileNavOpen(false);
              }}
              className="block text-primary font-bold text-base hover:text-primary/80 transition-colors py-2"
            >
              Quem Somos
            </a>
            <a
              href="#linha-temporal"
              onClick={(e) => {
                handleAnchorClick(e, '#linha-temporal');
                setMobileNavOpen(false);
              }}
              className="block text-primary font-bold text-base hover:text-primary/80 transition-colors py-2"
            >
              Linha Temporal
            </a>
            <a
              href="#podcast"
              onClick={(e) => {
                handleAnchorClick(e, '#podcast');
                setMobileNavOpen(false);
              }}
              className="block text-primary font-bold text-base hover:text-primary/80 transition-colors py-2"
            >
              Podcast
            </a>
            <a
              href="#beneficios-cooperados"
              onClick={(e) => {
                handleAnchorClick(e, '#beneficios-cooperados');
                setMobileNavOpen(false);
              }}
              className="block text-primary font-bold text-base hover:text-primary/80 transition-colors py-2"
            >
              Benefícios
            </a>
            <Link
              to="/servicos"
              onClick={() => setMobileNavOpen(false)}
              className={`block text-primary font-bold text-base hover:text-primary/80 transition-colors py-2 ${isActive('/servicos') ? 'text-accent' : ''}`}
            >
              Serviços
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
