#!/usr/bin/env python3
"""
Simulación Monte Carlo del cuestionario de Cupido Algorítmico.

1000 participantes sintéticos recorren las 33 preguntas (una por pantalla).
Se corren DOS brazos con las mismas personas (misma semilla):

  A) BASE     — sin ayudas, sin "lo pienso después", sin pausas guiadas
  B) DISEÑADO — con ayuda contextual por pregunta, botón "lo pienso después",
                autoguardado + retomar después, descansos entre bloques

Qué modela por persona (muestreada de distribuciones):
  introspección, apertura emocional, deseabilidad social, comodidad
  escribiendo (móvil vs escritorio), velocidad, y fatiga acumulada.

Qué modela por pregunta (parámetros editables abajo):
  carga cognitiva (cuánto hay que pensar), carga emocional (cuánto duele),
  esfuerzo de escritura y fricción de interfaz (matrices, rankings).

Salidas por pregunta y por brazo:
  % que se atora (>90 s sin poder empezar), % que abandona en esa pantalla,
  % de respuestas pobres (una línea / de aparador), tiempo mediano.

NOTA HONESTA: los parámetros son supuestos razonados, no datos de campo.
La simulación no predice números reales; sirve para RANKEAR riesgo por
pregunta y dimensionar cuánto rescata cada mecanismo de ayuda. Calibrar
con datos reales en cuanto existan.
"""

import json
import random
import statistics as st

N = 1000
SEED = 33

# ---------------------------------------------------------------- preguntas
# (id, tipo, bloque, cognitiva, emocional, escritura, fricción_UI)
QUESTIONS = [
    (1,  "OM", 1, 0.10, 0.10, 0.05, 0.10),
    (2,  "OM", 1, 0.20, 0.10, 0.05, 0.05),
    (3,  "OM", 1, 0.10, 0.40, 0.00, 0.05),
    (4,  "OM", 1, 0.25, 0.30, 0.20, 0.10),
    (5,  "OM", 1, 0.25, 0.30, 0.00, 0.10),
    (6,  "A",  2, 0.70, 0.30, 0.70, 0.00),
    (7,  "A",  2, 0.50, 0.40, 0.60, 0.00),
    (8,  "A",  2, 0.50, 0.30, 0.60, 0.00),
    (9,  "A",  2, 0.85, 0.40, 0.60, 0.00),
    (10, "A",  3, 0.80, 0.30, 0.80, 0.00),
    (11, "A",  3, 0.85, 0.50, 0.70, 0.00),
    (12, "OM", 3, 0.20, 0.20, 0.00, 0.10),
    (13, "OM", 3, 0.20, 0.20, 0.00, 0.05),
    (14, "OM", 4, 0.10, 0.10, 0.00, 0.10),
    (15, "OM", 4, 0.10, 0.10, 0.00, 0.05),
    (16, "A",  4, 0.60, 0.60, 0.60, 0.00),
    (17, "A",  4, 0.65, 0.20, 0.60, 0.00),
    (18, "OM", 4, 0.10, 0.10, 0.00, 0.05),
    (19, "OM", 5, 0.30, 0.40, 0.00, 0.05),
    (20, "A",  5, 0.70, 0.70, 0.70, 0.00),
    (21, "A",  5, 0.60, 0.50, 0.60, 0.00),
    (22, "A",  5, 0.60, 0.70, 0.60, 0.00),
    (23, "OM", 6, 0.50, 0.10, 0.00, 0.60),  # doble ranking: fricción de UI alta
    (24, "OM", 6, 0.20, 0.20, 0.00, 0.05),
    (25, "A",  6, 0.50, 0.80, 0.50, 0.00),
    (26, "A",  6, 0.55, 0.40, 0.60, 0.00),
    (27, "OM", 7, 0.40, 0.10, 0.00, 0.50),  # matriz hábito × tolerancia
    (28, "OM", 7, 0.20, 0.10, 0.00, 0.20),
    (29, "A",  7, 0.40, 0.10, 0.60, 0.00),
    (30, "OM", 7, 0.25, 0.25, 0.00, 0.05),
    (31, "A",  8, 0.70, 0.50, 0.60, 0.00),
    (32, "A",  8, 0.80, 0.90, 0.60, 0.00),
    (33, "A",  8, 0.70, 0.60, 0.80, 0.00),
]

BLOCK_END = {5, 9, 13, 18, 22, 26, 30}  # última pregunta de cada bloque


def make_people(rng):
    people = []
    for _ in range(N):
        people.append({
            "introspeccion": rng.betavariate(2.2, 2.0),
            "apertura":      rng.betavariate(2.0, 2.2),
            "deseabilidad":  rng.betavariate(2.0, 3.0),
            "velocidad":     rng.betavariate(3.0, 2.0) + 0.3,
            "movil":         rng.random() < 0.85,
            "constancia":    rng.betavariate(2.5, 1.8),  # prob. de retomar
        })
    return people


def run(people, designed, rng):
    """Corre el cuestionario completo para todas las personas en un brazo."""
    stats = {q[0]: {"atoro": 0, "abandono": 0, "pobre": 0, "tiempos": []}
             for q in QUESTIONS}
    completed = 0
    total_sessions = []

    for p in people:
        fatiga = 0.0
        alive = True
        sessions = 1
        deferred = []          # "lo pienso después"
        order = list(QUESTIONS)

        i = 0
        while i < len(order):
            q = order[i]
            qid, tipo, bloque, cog, emo, esc, ui = q

            # dificultad efectiva para ESTA persona
            d_cog = cog * (1.0 - 0.8 * p["introspeccion"])
            d_emo = emo * (1.0 - 0.8 * p["apertura"])
            d_esc = esc * (0.55 if p["movil"] else 0.15)
            d_ui  = ui * (1.4 if p["movil"] else 0.6)
            if designed:
                d_cog *= 0.45   # ejemplos + "empieza con..." destraban el pensar
                d_emo *= 0.65   # encuadre de por qué se pregunta + privacidad
                d_ui  *= 0.40   # UI simplificada (ranking por taps, matriz paso a paso)

            dificultad = d_cog + d_emo + d_esc + d_ui + 0.6 * fatiga

            # tiempo en pantalla (segundos)
            base = 18 if tipo == "OM" else 75
            t = (base * (1 + 1.6 * (d_cog + d_esc + d_ui))) / p["velocidad"]
            t *= rng.lognormvariate(0, 0.35)
            stats[qid]["tiempos"].append(t)

            # ¿se atora? (mira la pantalla >90 s sin poder empezar)
            p_atoro = min(0.9, 0.05 + 0.55 * (d_cog + d_emo))
            atorado = rng.random() < p_atoro
            if atorado:
                stats[qid]["atoro"] += 1

            # ¿abandona aquí?
            if atorado:
                if designed:
                    # puede diferir la pregunta y seguir
                    if rng.random() < 0.75:
                        deferred.append(q)
                        fatiga += 0.02
                        i += 1
                        continue
                    p_quit = 0.04 + 0.10 * fatiga
                else:
                    p_quit = 0.06 + 0.14 * fatiga
                if rng.random() < p_quit:
                    stats[qid]["abandono"] += 1
                    alive = False
                    break

            # ¿respuesta pobre? (una línea, de aparador)
            if tipo == "A":
                p_pobre = min(0.9, 0.10 + 0.5 * p["deseabilidad"] * emo
                              + 0.45 * fatiga + 0.25 * d_esc)
                if designed:
                    p_pobre *= 0.55  # ejemplos de respuesta real suben el estándar
                if rng.random() < p_pobre:
                    stats[qid]["pobre"] += 1

            # fatiga
            fatiga += 0.018 if tipo == "OM" else 0.045
            if designed and qid in BLOCK_END:
                fatiga *= 0.55  # descanso guiado + refuerzo de avance

            # ¿pausa la sesión? (con autoguardado eso NO es abandono)
            if fatiga > 0.55 and rng.random() < (0.20 if not designed else 0.22):
                if designed or rng.random() < 0.35:
                    # retoma más tarde (autosave). Sin autosave casi nadie vuelve.
                    p_volver = 0.85 * p["constancia"] if designed else 0.45 * p["constancia"]
                    if rng.random() < p_volver:
                        sessions += 1
                        fatiga = 0.12
                    else:
                        stats[qid]["abandono"] += 1
                        alive = False
                        break
                else:
                    stats[qid]["abandono"] += 1
                    alive = False
                    break
            i += 1
            # al final, las diferidas regresan (frescas tras un descanso)
            if i == len(order) and deferred:
                order = order + deferred
                deferred = []
                fatiga *= 0.7

        if alive:
            completed += 1
            total_sessions.append(sessions)

    return stats, completed, total_sessions


def summarize(stats, completed, label):
    print(f"\n=== BRAZO {label} — completaron {completed}/{N} "
          f"({100*completed/N:.1f}%) ===")
    print(f"{'P':>3} {'atoro%':>7} {'aband%':>7} {'pobre%':>7} {'t_med(s)':>9}")
    rows = {}
    for qid, s in stats.items():
        n = len(s["tiempos"]) or 1
        rows[qid] = {
            "atoro_pct": round(100 * s["atoro"] / n, 1),
            "abandono_pct": round(100 * s["abandono"] / n, 2),
            "pobre_pct": round(100 * s["pobre"] / n, 1),
            "t_mediano_s": round(st.median(s["tiempos"]), 0) if s["tiempos"] else 0,
            "vieron": n,
        }
        r = rows[qid]
        print(f"{qid:>3} {r['atoro_pct']:>7} {r['abandono_pct']:>7} "
              f"{r['pobre_pct']:>7} {r['t_mediano_s']:>9}")
    return rows


if __name__ == "__main__":
    rng = random.Random(SEED)
    people = make_people(rng)

    rng_a = random.Random(101)
    rng_b = random.Random(101)  # mismos dados para comparación justa
    stats_a, done_a, ses_a = run(people, designed=False, rng=rng_a)
    stats_b, done_b, ses_b = run(people, designed=True, rng=rng_b)

    rows_a = summarize(stats_a, done_a, "A · BASE (sin ayudas)")
    rows_b = summarize(stats_b, done_b, "B · DISEÑADO (con ayudas)")

    total_min_a = sum(st.median(s["tiempos"]) for s in stats_a.values() if s["tiempos"]) / 60
    total_min_b = sum(st.median(s["tiempos"]) for s in stats_b.values() if s["tiempos"]) / 60
    print(f"\nTiempo mediano total  A: {total_min_a:.0f} min   B: {total_min_b:.0f} min")
    print(f"Sesiones promedio     A: {st.mean(ses_a):.2f}      B: {st.mean(ses_b):.2f}")

    with open("resultados_montecarlo.json", "w") as f:
        json.dump({"base": rows_a, "disenado": rows_b,
                   "completaron": {"base": done_a, "disenado": done_b}}, f,
                  ensure_ascii=False, indent=1)
    print("\nGuardado: resultados_montecarlo.json")
