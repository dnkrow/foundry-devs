import { useId, useRef, useState, type FormEvent } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import styles from './Contact.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldErrors = Partial<Record<string, string>>;

/* Les deux premières entrées sont les demandes d'agence : elles arrivent en
   tête parce que c'est la priorité commerciale, sans exclure les autres. */
const PROJECT_TYPES = [
  'Renfort d’équipe',
  'Projet en marque blanche',
  'Application ou logiciel',
  'Site web sur mesure',
  'Intégration IA',
  'API ou back-end',
  'Reprise d’un projet existant',
  'Autre',
] as const;

const BUDGETS = [
  'Moins de 10 000 €',
  '10 000 – 25 000 €',
  '25 000 – 50 000 €',
  'Plus de 50 000 €',
  'À définir ensemble',
] as const;

/** L'échéance est la première contrainte d'un chef de projet : on la demande. */
const DEADLINES = [
  'Dès que possible',
  'Sous un mois',
  'D’un à trois mois',
  'Plus de trois mois',
  'Pas encore arrêtée',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validation côté client, doublée côté serveur : les deux sont nécessaires. */
function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const get = (key: string) => String(data.get(key) ?? '').trim();

  if (!get('name')) errors.name = 'Indiquez votre nom.';
  const email = get('email');
  if (!email) errors.email = 'Indiquez votre adresse e-mail.';
  else if (!EMAIL_PATTERN.test(email))
    errors.email = 'Cette adresse e-mail semble incomplète.';
  if (!get('projectType'))
    errors.projectType = 'Choisissez un type de projet.';
  const message = get('message');
  if (!message) errors.message = 'Décrivez votre projet en quelques lignes.';
  else if (message.length < 20)
    errors.message = 'Quelques lignes de plus nous aideraient (20 caractères minimum).';
  if (!data.get('consent'))
    errors.consent = 'Votre accord est nécessaire pour vous répondre.';

  return errors;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const id = useId();

  /** Effet d'impression : le bouton s'enfonce et laisse une empreinte d'encre. */
  const stamp = () => {
    const button = buttonRef.current;
    if (!button || prefersReducedMotion()) return;
    const ink = button.querySelector('[data-ink]');
    gsap
      .timeline()
      .to(button, { scale: 0.965, duration: 0.09, ease: 'power2.in' })
      .to(button, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.55)' })
      .fromTo(
        ink,
        { scale: 0.2, opacity: 0.55 },
        { scale: 2.4, opacity: 0, duration: 0.75, ease: 'power2.out' },
        0.04,
      );
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    stamp();
    const form = event.currentTarget;
    const data = new FormData(form);
    const found = validate(data);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus('error');
      setServerError(null);
      // Le focus rejoint le premier champ fautif.
      const firstKey = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });

      // Sans route serveur, un serveur de développement renvoie l'index HTML
      // avec un statut 200 : on refuse toute réponse qui n'est pas du JSON
      // plutôt que d'annoncer un envoi qui n'a pas eu lieu.
      const isJson = response.headers
        .get('Content-Type')
        ?.includes('application/json');

      if (!response.ok || !isJson) {
        const payload = (isJson
          ? await response.json().catch(() => null)
          : null) as {
          message?: string;
          errors?: FieldErrors;
        } | null;
        if (payload?.errors) setErrors(payload.errors);
        setServerError(
          payload?.message ??
            'L’envoi a échoué. Réessayez, ou écrivez-nous directement par e-mail.',
        );
        setStatus('error');
        return;
      }

      form.reset();
      setStatus('sent');
    } catch {
      setServerError(
        'Connexion impossible. Vérifiez votre réseau, ou écrivez-nous directement par e-mail.',
      );
      setStatus('error');
    }
  };

  const describedBy = (field: string) =>
    errors[field] ? `${id}-${field}-error` : undefined;

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={`${id}-status`}
    >
      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>Nom</label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
        />
        <FieldError id={`${id}-name-error`} message={errors.name} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>E-mail professionnel</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email')}
        />
        <FieldError id={`${id}-email-error`} message={errors.email} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-company`}>
          Agence ou société <span className={styles.optional}>(optionnel)</span>
        </label>
        <input
          id={`${id}-company`}
          name="company"
          type="text"
          autoComplete="organization"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-projectType`}>Type de projet</label>
        <select
          id={`${id}-projectType`}
          name="projectType"
          defaultValue=""
          aria-invalid={Boolean(errors.projectType)}
          aria-describedby={describedBy('projectType')}
        >
          <option value="" disabled>
            Choisir…
          </option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <FieldError id={`${id}-projectType-error`} message={errors.projectType} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-budget`}>
          Budget indicatif <span className={styles.optional}>(optionnel)</span>
        </label>
        <select id={`${id}-budget`} name="budget" defaultValue="">
          <option value="">Sans précision</option>
          {BUDGETS.map((budget) => (
            <option key={budget} value={budget}>
              {budget}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-deadline`}>
          Échéance <span className={styles.optional}>(optionnel)</span>
        </label>
        <select id={`${id}-deadline`} name="deadline" defaultValue="">
          <option value="">Sans précision</option>
          {DEADLINES.map((deadline) => (
            <option key={deadline} value={deadline}>
              {deadline}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label htmlFor={`${id}-message`}>Le besoin</label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
        />
        <FieldError id={`${id}-message-error`} message={errors.message} />
      </div>

      <div className={`${styles.field} ${styles.fieldWide} ${styles.consent}`}>
        <div className={styles.checkboxRow}>
          <input
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            value="oui"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describedBy('consent')}
          />
          <label htmlFor={`${id}-consent`}>
            J’accepte que ces informations soient utilisées pour répondre à ma
            demande.
          </label>
        </div>
        <FieldError id={`${id}-consent-error`} message={errors.consent} />
      </div>

      <div className={styles.submitRow}>
        <button
          ref={buttonRef}
          type="submit"
          className={styles.submit}
          data-status={status}
          disabled={status === 'sending'}
        >
          <span className={styles.ink} data-ink aria-hidden="true" />
          <span className={styles.submitLabel}>
            {status === 'sending' ? 'Envoi en cours' : 'Envoyer la demande'}
          </span>
          <span className={styles.submitBar} aria-hidden="true" />
        </button>

        {/* Zone d'état : annoncée aux lecteurs d'écran à chaque changement. */}
        <p
          id={`${id}-status`}
          className={styles.status}
          data-status={status}
          role="status"
          aria-live="polite"
        >
          {status === 'sending' && 'Envoi de votre demande…'}
          {status === 'sent' &&
            'Demande envoyée. Nous revenons vers vous rapidement.'}
          {status === 'error' &&
            (serverError ?? 'Le formulaire comporte des erreurs à corriger.')}
        </p>
      </div>
    </form>
  );
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p id={id} className={styles.error}>
      {message}
    </p>
  );
}
