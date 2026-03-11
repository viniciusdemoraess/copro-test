import React from "react";
import { Instagram } from "lucide-react";
import cooprosojaLogo from "@/assets/cooprosoja-logo.png";

const Footer: React.FC = () => {
  return (
    <footer id="contato" className="bg-background border-t border-border py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <img
            src={cooprosojaLogo}
            className="h-10 sm:h-12 w-auto"
            alt="Cooprosoja Logo"
          />

          {/* Copyright */}
          <p className="text-muted-foreground text-sm text-center order-3 sm:order-2">
            © {new Date().getFullYear()} Cooprosoja. Todos os direitos reservados.
          </p>

          {/* Instagram */}
          <a
            href="https://instagram.com/CooprosojaMT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-brand-yellow transition-colors order-2 sm:order-3"
            aria-label="Instagram da Cooprosoja"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-sm font-medium">@CooprosojaMT</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
