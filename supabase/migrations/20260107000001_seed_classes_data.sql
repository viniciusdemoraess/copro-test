-- Inserção de dados de exemplo para a tabela classes
-- Classes de colheitadeiras com especificações técnicas e financeiras

INSERT INTO classes (
  classe,
  plataforma_pes,
  potencia,
  preco_compra,
  vida_util_anos,
  valor_revenda_percent,
  manutencao_percent,
  seguro_percent,
  rendimento_ha_hora,
  usar_sugestoes,
  quantidade_personalizada,
  hectares_por_dia
) VALUES
  ('Classe 5', 25, '260 CV', 1890000, 10, 35.0, 50.0, 1.0, 6.0, true, 0, 36.0),
  ('Classe 6', 30, '338 CV', 2540000, 10, 35.0, 50.0, 1.0, 7.0, true, 0, 42.0),
  ('Classe 7', 35, '370 CV', 3040000, 10, 35.0, 50.0, 1.0, 8.0, true, 0, 48.0),
  ('Classe 8', 40, '480 CV', 3500000, 10, 35.0, 50.0, 1.0, 9.0, true, 0, 54.0),
  ('Classe 9', 45, '560 CV', 4000000, 10, 35.0, 50.0, 1.0, 10.0, true, 0, 60.0),
  ('Classe 10', 50, '656 CV', 4500000, 10, 35.0, 50.0, 1.0, 12.0, true, 0, 72.0),
  ('Classe 11', 60, '750 CV', 5500000, 10, 35.0, 50.0, 1.0, 13.0, true, 0, 78.0)
ON CONFLICT (classe) DO NOTHING;
