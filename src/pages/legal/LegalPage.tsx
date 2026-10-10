import { useTranslation } from '../../i18n/useTranslation';

type LegalPageKind = 'privacy' | 'terms' | 'support';

type LegalPageProps = {
  kind: LegalPageKind;
};

const supportEmail = 'support@juuls-trinkets.com';

const legalContent: Record<LegalPageKind, {
  titleKey: string;
  leadKey: string;
  sections: Array<{ titleKey: string; bodyKey: string }>;
}> = {
  privacy: {
    titleKey: 'legal.privacy.title',
    leadKey: 'legal.privacy.lead',
    sections: [
      {
        titleKey: 'legal.privacy.data.title',
        bodyKey: 'legal.privacy.data.body',
      },
      {
        titleKey: 'legal.privacy.use.title',
        bodyKey: 'legal.privacy.use.body',
      },
      {
        titleKey: 'legal.privacy.sharing.title',
        bodyKey: 'legal.privacy.sharing.body',
      },
      {
        titleKey: 'legal.privacy.retention.title',
        bodyKey: 'legal.privacy.retention.body',
      },
      {
        titleKey: 'legal.deletion.title',
        bodyKey: 'legal.privacy.deletion.body',
      },
    ],
  },
  terms: {
    titleKey: 'legal.terms.title',
    leadKey: 'legal.terms.lead',
    sections: [
      {
        titleKey: 'legal.terms.service.title',
        bodyKey: 'legal.terms.service.body',
      },
      {
        titleKey: 'legal.terms.accounts.title',
        bodyKey: 'legal.terms.accounts.body',
      },
      {
        titleKey: 'legal.terms.availability.title',
        bodyKey: 'legal.terms.availability.body',
      },
      {
        titleKey: 'legal.terms.support.title',
        bodyKey: 'legal.terms.support.body',
      },
    ],
  },
  support: {
    titleKey: 'legal.support.title',
    leadKey: 'legal.support.lead',
    sections: [
      {
        titleKey: 'legal.support.email.title',
        bodyKey: 'legal.support.email.body',
      },
      {
        titleKey: 'legal.support.include.title',
        bodyKey: 'legal.support.include.body',
      },
      {
        titleKey: 'legal.deletion.title',
        bodyKey: 'legal.support.deletion.body',
      },
    ],
  },
};

export function LegalPage({ kind }: LegalPageProps) {
  const { t } = useTranslation();
  const content = legalContent[kind];

  return (
    <section className="legal-page">
      <div className="legal-header">
        <h1>{t(content.titleKey)}</h1>
        <p>{t(content.leadKey, { supportEmail })}</p>
      </div>
      <div className="legal-sections">
        {content.sections.map((section) => (
          <section className="legal-section" key={section.titleKey}>
            <h2>{t(section.titleKey)}</h2>
            <p>{t(section.bodyKey, { supportEmail })}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
