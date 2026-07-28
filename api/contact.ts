/**
 * Route serveur du formulaire de contact.
 *
 * Écrite au format Web standard (Request/Response) : elle fonctionne telle
 * quelle sur Vercel Functions, Netlify Functions et tout runtime compatible.
 *
 * Aucun fournisseur n'est câblé en dur. Deux modes de transport, choisis par
 * variables d'environnement — jamais exposées au client :
 *
 *   • CONTACT_WEBHOOK_URL  → le message est transmis à l'URL indiquée
 *                            (service d'e-mail, automatisation, CRM…).
 *   • RESEND_API_KEY + CONTACT_TO + CONTACT_FROM
 *                          → envoi direct par l'API HTTP de Resend.
 *
 * Sans configuration, la route répond 503 avec un message explicite : le
 * formulaire ne fait jamais semblant d'avoir envoyé quoi que ce soit.
 */

type Payload = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  message: string;
  consent: string;
};

type FieldErrors = Partial<Record<keyof Payload, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LENGTH = 5000;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

const clean = (value: unknown): string =>
  typeof value === 'string' ? value.trim().slice(0, MAX_LENGTH) : '';

/** Revalidation serveur : la validation client n'est qu'un confort. */
function validate(data: Payload): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name) errors.name = 'Indiquez votre nom.';
  if (!data.email) errors.email = 'Indiquez votre adresse e-mail.';
  else if (!EMAIL_PATTERN.test(data.email))
    errors.email = 'Cette adresse e-mail semble incomplète.';
  if (!data.projectType) errors.projectType = 'Choisissez un type de projet.';
  if (data.message.length < 20)
    errors.message = 'Décrivez votre projet en quelques lignes.';
  if (!data.consent) errors.consent = 'Votre accord est nécessaire.';
  return errors;
}

function format(data: Payload): string {
  return [
    `Nom : ${data.name}`,
    `E-mail : ${data.email}`,
    `Entreprise : ${data.company || '—'}`,
    `Type de projet : ${data.projectType}`,
    `Budget indicatif : ${data.budget || '—'}`,
    '',
    data.message,
  ].join('\n');
}

async function deliver(data: Payload): Promise<'sent' | 'unconfigured'> {
  const env = process.env;

  if (env.CONTACT_WEBHOOK_URL) {
    const response = await fetch(env.CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
    });
    if (!response.ok) {
      throw new Error(`Webhook en échec : ${response.status}`);
    }
    return 'sent';
  }

  if (env.RESEND_API_KEY && env.CONTACT_TO && env.CONTACT_FROM) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: data.email,
        subject: `Demande de projet — ${data.name}`,
        text: format(data),
      }),
    });
    if (!response.ok) {
      throw new Error(`Envoi en échec : ${response.status}`);
    }
    return 'sent';
  }

  return 'unconfigured';
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Requête illisible.' }, 400);
  }

  const raw = body as Record<string, unknown>;
  const data: Payload = {
    name: clean(raw.name),
    email: clean(raw.email),
    company: clean(raw.company),
    projectType: clean(raw.projectType),
    budget: clean(raw.budget),
    message: clean(raw.message),
    consent: clean(raw.consent),
  };

  const errors = validate(data);
  if (Object.keys(errors).length > 0) {
    return json(
      { message: 'Certains champs demandent une correction.', errors },
      422,
    );
  }

  try {
    const result = await deliver(data);
    if (result === 'unconfigured') {
      console.warn(
        'Formulaire non configuré : définir CONTACT_WEBHOOK_URL, ou RESEND_API_KEY + CONTACT_TO + CONTACT_FROM.',
      );
      return json(
        {
          message:
            'L’envoi n’est pas encore actif sur ce site. Écrivez-nous directement par e-mail.',
        },
        503,
      );
    }
    return json({ message: 'Demande envoyée.' }, 200);
  } catch (error) {
    console.error('Échec de transmission du formulaire de contact', error);
    return json(
      {
        message:
          'L’envoi a échoué de notre côté. Réessayez, ou écrivez-nous directement par e-mail.',
      },
      502,
    );
  }
}

/** Toute autre méthode est refusée explicitement. */
export function GET(): Response {
  return json({ message: 'Méthode non autorisée.' }, 405);
}
