import { roles } from '../data/questions';

interface RoleSelectProps {
  completedRoles: string[];
  onSelectRole: (roleId: string) => void;
  onGenerateReport: () => void;
  allCompleted: boolean;
  companyName: string;
}

export default function RoleSelect({
  completedRoles,
  onSelectRole,
  onGenerateReport,
  allCompleted,
  companyName,
}: RoleSelectProps) {
  return (
    <div className="fade-in">
      <div className="role-select-header">
        <h1>Strategie-Check: {companyName || 'Unternehmen'}</h1>
        <p>
          Wählen Sie eine Rolle aus, um den Fragebogen als diese Führungskraft zu beantworten.
          <br />
          <strong>{completedRoles.length} von {roles.length}</strong> Rollen abgeschlossen.
        </p>
      </div>

      <div className="role-grid">
        {roles.map(role => {
          const isCompleted = completedRoles.includes(role.id);
          return (
            <div
              key={role.id}
              className={`role-card ${isCompleted ? 'completed' : ''}`}
              onClick={() => onSelectRole(role.id)}
            >
              <div className="role-card-icon">{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <span className={`role-card-badge ${isCompleted ? 'done' : 'pending'}`}>
                {isCompleted ? 'Abgeschlossen' : 'Ausstehend'}
              </span>
              {isCompleted && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--cic-text-secondary)' }}>
                  Klicken zum erneuten Bearbeiten
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="role-select-footer">
        {allCompleted ? (
          <button className="btn btn-primary btn-lg" onClick={onGenerateReport}>
            Report generieren
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <p style={{ color: 'var(--cic-text-secondary)', fontSize: 14 }}>
            Bitte schließen Sie alle Rollen ab, um den Report zu generieren.
          </p>
        )}
      </div>
    </div>
  );
}
