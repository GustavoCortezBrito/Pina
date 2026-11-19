import { z } from "zod";

// A política de segurança do sistema (CSP) proíbe `eval`. O Zod 4 testa `new Function` para acelerar a
// validação e, se o navegador barra, cai no modo normal, mas cada teste vira um aviso de violação em toda
// tela com formulário. No navegador, desligamos esse atalho; a validação é igual, só sem o JIT.
z.config({ jitless: true });
