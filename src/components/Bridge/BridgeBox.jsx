import React from 'react'
import TokenBadge from './TokenBadge'

const BridgeBox = (props) => {
  const { title, badgeType, max, handleOpenModal } = props
  const [amount, setAmount] = React.useState(0)
  // TODO change to dynamic data
  const balance = 23.33
  return (
    <div className="bridge-box">
      <div className="flex-between">
        <div className="bridge-from">{title}</div>
        <div className="bridge-from font-weight-600">Balance: 34</div>
      </div>
      <div className="flex-between pt-13">
        <div>
          <input
            type="text"
            className="input-transparent bridge-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="bridge-token ">
          {max && (
            <div
              onClick={() => setAmount(balance)}
              className="bridge-max pointer"
            >
              Max
            </div>
          )}
          <TokenBadge badgeType={badgeType} icon="icon.svg" />
          <div
            className="bridge-assets"
            onClick={() => handleOpenModal(badgeType)}
          >
            DEUS <img src="/img/arrow-nav.svg" alt="arrow" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BridgeBox
