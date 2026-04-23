import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute',
        top: -100, right: -100,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'rgba(30, 111, 217, 0.1)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -100, left: -100,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.1)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>📆</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700, color: 'white',
            }}>RDVPro</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10, color: 'var(--teal)',
              fontWeight: 600, letterSpacing: '0.08em',
            }}>
              GESTION DE RENDEZ-VOUS
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/login"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Connexion
          </Link>
          <Link
            to="/register"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'var(--blue)',
              border: 'none',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
          maxWidth: 1200,
        }}>
          {/* Left side - Hero */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--teal)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Bienvenue sur RDVPro
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: 24,
            }}>
              Gérez vos rendez-vous avec précision
            </h1>

            <p style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6,
              marginBottom: 40,
            }}>
              Plateforme professionnelle de gestion de rendez-vous — rapide, fiable, et élégante. Simplifiez votre processus de réservation et améliorez l'expérience de vos clients.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {[
                { icon: '📅', text: 'Planification intelligente des créneaux' },
                { icon: '🔔', text: 'Rappels automatiques par e-mail' },
                { icon: '📊', text: 'Tableau de bord analytique en temps réel' },
                { icon: '👥', text: 'Gestion complète des clients' },
                { icon: '🔐', text: 'Sécurité et confidentialité garanties' },
              ].map(f => (
                <div key={f.text} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <span style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.85)',
                  }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <Link
                to="/register"
                style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  background: 'var(--blue)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 111, 217, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Créer un compte maintenant →
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>

          {/* Right side - Visual */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 40,
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 20,
              }}>
                {[
                  { num: '500+', label: 'Rendez-vous' },
                  { num: '250+', label: 'Clients' },
                  { num: '98%', label: 'Satisfaction' },
                  { num: '24/7', label: 'Disponible' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 12,
                    padding: 20,
                  }}>
                    <div style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: 'var(--teal)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {stat.num}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: 6,
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 111, 217, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 24,
              }}>
                <div style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 12,
                }}>
                  💡 Prêt à commencer ?
                </div>
                <div style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  Rejoignez plus de 1000 professionnels qui utilisent RDVPro pour gérer leurs rendez-vous.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        position: 'relative',
        zIndex: 10,
      }}>
        © 2026 RDVPro — Plateforme de gestion de rendez-vous. Tous droits réservés.
      </footer>
    </div>
  );
}
