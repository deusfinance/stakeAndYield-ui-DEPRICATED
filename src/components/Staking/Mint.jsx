import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../../connectors'
import {
  ApproveTranaction,
  getEtherscanLink,
  CustomTranaction
} from '../../utils/explorers'
import { TransactionState } from '../../utils/constant'
import abis from '../../services/abis.json'
import { web3, makeContract } from '../../utils/Stakefun'

const Mint = (props) => {
  const {
    lockStakeType,
    balanceWallet,
    owner,
    chainId,
    handleBack,
    vaultContract,
    StakedTokenContract,
    title
  } = props

  const web3React = useWeb3React()
  const { activate } = web3React
  const [amount, setAmount] = React.useState('')
  const [approve, setApprove] = React.useState(false)
  const [approveClick, setApproveClick] = React.useState(false)
  const [sealedTime, setSealedTime] = React.useState({
    sealed: '0',
    time: '0'
  })

  const VaultContract = makeContract(abis['vaults'], vaultContract)

  React.useEffect(() => {
    if (owner && vaultContract) checkApprove()
  }, [owner, vaultContract])

  let subscription = web3.eth.subscribe(
    'newBlockHeaders',
    function (error, result) {
      if (!error) {
        if (owner && vaultContract) {
          checkApprove()
        }
        return
      }
      console.error(error)
    }
  )

  // unsubscribes the subscription
  subscription.unsubscribe(function (error, success) {
    if (success) {
      console.log('Successfully unsubscribed!')
    }
  })

  const checkApprove = async () => {
    if (StakedTokenContract) {
      let approve = await StakedTokenContract.methods
        .allowance(owner, vaultContract)
        .call()
      approve = Number(web3.utils.fromWei(approve, 'ether'))
      setApprove(approve)
    }
  }

  const getSealedTimeAmount = async (amount) => {
    setAmount(amount)
    if (amount && owner) {
      amount = web3.utils.toWei(amount)
      const result = await VaultContract.methods
        .sealedAndTimeAmount(owner, amount)
        .call()
      setSealedTime({
        sealed: web3.utils.fromWei(result[0], 'ether'),
        time: web3.utils.fromWei(result[1], 'ether')
      })
    } else {
      setSealedTime({
        sealed: 0,
        time: 0
      })
    }
  }

  const handleConnect = async () => {
    try {
      const data = await activate(injected)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleApprove = async () => {
    try {
      if (!owner) {
        return
      }
      let amount = web3.utils.toWei('1000000000000000000')
      await StakedTokenContract.methods
        .approve(vaultContract, amount)
        .send({ from: owner })
        .once('transactionHash', (hash) =>
          ApproveTranaction(TransactionState.LOADING, {
            hash,
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title,
              amount
            },
            chainId
          })
        )
        .once('receipt', ({ transactionHash }) => {
          setApproveClick(true)
          ApproveTranaction(TransactionState.SUCCESS, {
            hash: transactionHash,
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title,
              amount
            },
            chainId
          })
        })
        .once('error', (error) => {
          CustomTranaction(TransactionState.FAILED, {
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title,
              amount
            },
            chainId
          })
        })
    } catch (error) {
      console.log('Error Happend in Fun approve', error)
      CustomTranaction(TransactionState.FAILED, {
        from: {
          logo: `/img/bridge/${title}.svg`,
          symbol: title,
          amount
        },
        chainId
      })
    }
  }
  const handleMint = async () => {
    try {
      if (!owner) {
        return
      }
      if (amount === '' || amount === '0') return
      let amountVault = web3.utils.toWei(amount)
      console.log(amountVault)
      await VaultContract.methods
        .lock(amountVault)
        .send({ from: owner })
        .once('transactionHash', (hash) =>
          CustomTranaction(TransactionState.LOADING, {
            hash,
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title,
              amount
            },
            chainId,
            message: `Mint ${amount} ${title}`
          })
        )
        .once('receipt', ({ transactionHash }) => {
          setAmount('')
          console.log({ transactionHash })
          CustomTranaction(TransactionState.SUCCESS, {
            hash: transactionHash,
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title,
              amount
            },
            chainId,
            message: `Mint ${amount} ${title}`
          })
        })
        .once('error', (hash) =>
          CustomTranaction(TransactionState.FAILED, {
            from: {
              logo: `/img/bridge/${title}.svg`,
              symbol: title
            },
            chainId
          })
        )
    } catch (error) {
      console.log(error)
      CustomTranaction(TransactionState.FAILED, {
        from: {
          logo: `/img/bridge/${title}.svg`,
          symbol: title,
          amount
        },
        chainId
      })
    }
  }
  return (
    <>
      {lockStakeType && (
        <div className="back-btn pointer" onClick={handleBack}>
          Back
        </div>
      )}

      <div className="deposite-container">
        <div>
          <p className="lock-text">LOCK TO RECEIVE sTOKENS</p>
        </div>
        <div>
          <p className="balance-wallet"> {`Balance: ${balanceWallet}`}</p>
        </div>
        <div className="gray-box flex-between">
          <input
            type="text"
            className="input-transparent"
            placeholder="0 DEA"
            value={amount}
            onChange={(e) => {
              getSealedTimeAmount(e.target.value)
            }}
          />
          <span
            className="box-balance-max pointer"
            onClick={() => {
              getSealedTimeAmount(balanceWallet)
            }}
          >
            Max
          </span>
        </div>
        <div className="contract-box">
          <a
            className="show-contract pointer"
            href={getEtherscanLink(chainId, vaultContract)}
            target="_blink"
          >
            Show me the contract
          </a>
        </div>
        <div className="convert-box-mint">
          <span>{`mint ${sealedTime.sealed} ${title}`}</span>
        </div>
        <div className="convert-box-mint">
          <span>{`mint ${sealedTime.time} TIME`}</span>
        </div>

        {owner ? (
          chainId == 1 || chainId == 4 ? (
            <>
              <div className={!approve ? 'flex-between' : 'flex-center'}>
                {approve == 0 && (
                  <div
                    className={`${
                      !approveClick ? 'approve-btn' : 'stake-deposite-btn'
                    } pointer`}
                    onClick={handleApprove}
                  >
                    Approve
                  </div>
                )}

                <div
                  className={`${
                    approveClick ? 'approve-btn pointer' : 'stake-deposite-btn'
                  } ${approve ? 'pointer' : ''}`}
                  onClick={handleMint}
                >
                  Mint
                </div>
              </div>
              {approve == 0 && (
                <div className="flex-center">
                  <div className="container-status-button">
                    <div className="active">1</div>
                    <div className={approveClick ? 'active' : ''}>2</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <a className="wrong-network">
              <span>Wrong Network</span>
            </a>
          )
        ) : (
          <div
            className="wrap-box-gradient-complete width-415 pointer"
            onClick={handleConnect}
          >
            <div>connect wallet</div>
          </div>
        )}
      </div>
    </>
  )
}

export default Mint
