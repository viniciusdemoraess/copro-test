CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_about_content_section_key ON public.about_content(section_key);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver conteúdo sobre"
  ON public.about_content FOR SELECT
  USING (true);

CREATE POLICY "Autenticados podem inserir conteúdo sobre"
  ON public.about_content FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem atualizar conteúdo sobre"
  ON public.about_content FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar conteúdo sobre"
  ON public.about_content FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.about_content (section_key, title, content, image_url)
VALUES
  ('why_we_exist', 'Por Que Existimos', '<p>A Cooprosoja nasceu para resolver um problema real que atinge milhares de produtores: o pequeno e médio agricultor sempre pagou mais caro do que os grandes grupos. Enquanto os grandes conglomerados compram em alto volume e conseguem condições muito mais vantajosas, o produtor individual acaba arcando com valores até 30% maiores.</p><p>A Cooprosoja existe com um propósito simples e direto: unir produtores para ampliar o poder de compra, garantir preços justos e romper com a lógica desigual que sempre penalizou quem produz em menor escala. Quando somamos nossas demandas, negociamos com força, conquistamos descontos reais e deixamos de ser reféns de quem dita as regras no mercado, <em>garantindo, dessa forma, a permanência das futuras gerações no campo</em>.</p><p>Em pouco tempo, já somos mais de 1.300 produtores em mais de 86 municípios de Mato Grosso. E cada novo cooperado fortalece ainda mais a nossa capacidade de negociação. A prova disso está nos negócios já realizados: colheitadeiras, carregadeiras, implementos e equipamentos adquiridos com valores muito abaixo do que qualquer produtor conseguiria sozinho.</p><p>A Cooprosoja existe para proteger o produtor rural, garantir competitividade, evitar que os pequenos e médios sejam engolidos pelos grandes e construir um futuro mais justo e sustentável. Aqui, ninguém fica para trás. Unidos, nivelamos o jogo. Independentemente do tamanho da propriedade, todos têm voz, força e oportunidades iguais.</p><p>Esse é o compromisso que nos move e que continuará guiando o crescimento da nossa cooperativa.</p>', ''),
  ('informations', 'Informações Cooprosoja', '<p>Na Cooprosoja, acreditamos que a verdadeira força do produtor está na união. É quando caminhamos juntos que conseguimos transformar desafios em oportunidades e conquistar o espaço que sempre foi nosso por direito.</p><p>Nosso compromisso é simples: garantir que cada produtor tenha acesso aos mesmos benefícios, condições e preços que antes eram exclusivos dos grandes grupos. Trabalhamos para construir um mercado mais justo, transparente e acessível, onde o pequeno e o médio produtor podem comprar melhor, pagar menos e crescer com segurança.</p><p>Quando você tem a Cooprosoja ao seu lado, você deixa de negociar sozinho. Ganha poder, voz e competitividade. E passa a disputar de igual para igual com os maiores players do setor.</p><p>Aqui, nivelamos o jogo para você — para que hoje você economize, e amanhã sua próxima geração colha ainda mais resultados.</p>', NULL)
ON CONFLICT (section_key) DO NOTHING;
