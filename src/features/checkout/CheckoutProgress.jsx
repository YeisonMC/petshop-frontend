import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import './checkout.css'

const steps = ['Carrito', 'Envío', 'Pago', 'Confirmación']

export default function CheckoutProgress({ current = 2 }) {
  return (
    <div className="checkout-progress-wrap">
      <h1 className="checkout-mobile-title">{steps[current - 1]}</h1>
      <nav aria-label="Progreso de compra">
        <ol className="checkout-progress">
          {steps.map((label, index) => {
            const number = index + 1
            const complete = number < current
            const active = number === current

            return (
              <li
                className={`checkout-progress__step${complete ? ' is-complete' : ''}${active ? ' is-active' : ''}`}
                aria-current={active ? 'step' : undefined}
                key={label}
              >
                <span className="checkout-progress__bubble" aria-hidden="true">
                  {complete ? <Check size={17} strokeWidth={3} /> : number}
                </span>
                <span className="checkout-progress__label">{label}</span>
                {index < steps.length - 1 && (
                  <span className="checkout-progress__line" aria-hidden="true">
                    {complete && (
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.45, delay: index * 0.12 }}
                      />
                    )}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
