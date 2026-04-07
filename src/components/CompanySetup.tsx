interface CompanyInfo {
  name: string;
  industry: string;
  employees: string;
}

interface CompanySetupProps {
  company: CompanyInfo;
  onChange: (company: CompanyInfo) => void;
  onNext: () => void;
}

export default function CompanySetup({ company, onChange, onNext }: CompanySetupProps) {
  const canProceed = company.name.trim().length > 0;

  return (
    <div className="setup-container">
      <div className="card">
        <h2>Unternehmen einrichten</h2>
        <p className="card-subtitle">
          Geben Sie die grundlegenden Informationen zum bewerteten Unternehmen ein.
        </p>

        <div className="form-group">
          <label className="form-label">Unternehmensname *</label>
          <input
            type="text"
            className="form-input"
            placeholder="z.B. Mustermann GmbH"
            value={company.name}
            onChange={e => onChange({ ...company, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Branche</label>
          <select
            className="form-input form-select"
            value={company.industry}
            onChange={e => onChange({ ...company, industry: e.target.value })}
          >
            <option value="">Branche auswählen...</option>
            <option value="Dienstleistung">Dienstleistung</option>
            <option value="Produktion / Fertigung">Produktion / Fertigung</option>
            <option value="Handel">Handel</option>
            <option value="IT / Technologie">IT / Technologie</option>
            <option value="Gesundheitswesen">Gesundheitswesen</option>
            <option value="Hotellerie / Gastronomie">Hotellerie / Gastronomie</option>
            <option value="Handwerk">Handwerk</option>
            <option value="Finanzen / Versicherung">Finanzen / Versicherung</option>
            <option value="Sonstige">Sonstige</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Mitarbeiteranzahl</label>
          <select
            className="form-input form-select"
            value={company.employees}
            onChange={e => onChange({ ...company, employees: e.target.value })}
          >
            <option value="">Auswählen...</option>
            <option value="1-10">1 - 10</option>
            <option value="11-50">11 - 50</option>
            <option value="51-200">51 - 200</option>
            <option value="201-500">201 - 500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <div className="nav-buttons" style={{ borderTop: 'none', marginTop: 8, paddingTop: 0 }}>
          <div />
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canProceed}
            style={{ opacity: canProceed ? 1 : 0.5 }}
          >
            Weiter zu Rollen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
