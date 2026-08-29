import { create } from 'zustand'

export interface GameRecord {
  id: string
  provider: string
  gameName: string
  score: number
  reward: string
  multiplier: number
  timestamp: Date
  result: 'win' | 'loss'
}

export interface PlayerProfile {
  address: string
  totalBalance: string
  playableBalance: string
  withdrawableBalance: string
  totalPlayed: string
  currentMultiplier: number
  hasClaimedSignupBonus: boolean
  debitCardLinked: boolean
  debitCardLast4: string
  totalGamesPlayed: number
  totalWinnings: string
  joined: Date
}

interface GameStore {
  playerProfile: PlayerProfile | null
  gameHistory: GameRecord[]
  
  // Actions
  setPlayerProfile: (profile: PlayerProfile) => void
  initializeNewPlayer: (address: string) => void
  addGameResult: (game: GameRecord) => void
  updateBalance: (playable: string, withdrawable: string) => void
  updateMultiplier: (multiplier: number) => void
  linkDebitCard: (last4: string) => void
  claimSignupBonus: () => void
  withdrawFunds: (amount: string, cardLast4: string) => Promise<boolean>
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerProfile: null,
  gameHistory: [],

  setPlayerProfile: (profile) => set({ playerProfile: profile }),

  initializeNewPlayer: (address) => {
    // New player gets 300 tokens on signup
    const newProfile: PlayerProfile = {
      address,
      totalBalance: '300000000000000000000', // 300 CPOK (18 decimals)
      playableBalance: '300000000000000000000',
      withdrawableBalance: '0',
      totalPlayed: '0',
      currentMultiplier: 0,
      hasClaimedSignupBonus: true,
      debitCardLinked: false,
      debitCardLast4: '',
      totalGamesPlayed: 0,
      totalWinnings: '0',
      joined: new Date(),
    }
    set({ playerProfile: newProfile })
  },

  addGameResult: (game) => {
    set((state) => {
      if (!state.playerProfile) return state

      const gameHistory = [game, ...state.gameHistory].slice(0, 100)
      
      // Calculate new balance based on game result
      const gameRewardBigInt = BigInt(game.reward)
      const currentPlayable = BigInt(state.playerProfile.playableBalance)
      
      let newPlayableBalance: string
      let newWithdrawableBalance: string
      let newMultiplier: number

      if (game.result === 'win') {
        // Win: Add to playable balance AND increase multiplier
        newPlayableBalance = (currentPlayable + gameRewardBigInt).toString()
        newWithdrawableBalance = state.playerProfile.withdrawableBalance
        newMultiplier = state.playerProfile.currentMultiplier + game.multiplier
      } else {
        // Loss: Subtract from playable balance
        newPlayableBalance = (currentPlayable > gameRewardBigInt 
          ? currentPlayable - gameRewardBigInt 
          : '0'
        ).toString()
        newWithdrawableBalance = state.playerProfile.withdrawableBalance
        newMultiplier = Math.max(0, state.playerProfile.currentMultiplier - 0.1)
      }

      const updatedProfile: PlayerProfile = {
        ...state.playerProfile,
        playableBalance: newPlayableBalance,
        withdrawableBalance: newWithdrawableBalance,
        totalPlayed: (BigInt(state.playerProfile.totalPlayed) + gameRewardBigInt).toString(),
        currentMultiplier: newMultiplier,
        totalGamesPlayed: state.playerProfile.totalGamesPlayed + 1,
        totalWinnings: game.result === 'win' 
          ? (BigInt(state.playerProfile.totalWinnings) + gameRewardBigInt).toString()
          : state.playerProfile.totalWinnings,
      }

      return {
        playerProfile: updatedProfile,
        gameHistory,
      }
    })
  },

  updateBalance: (playable, withdrawable) => {
    set((state) => {
      if (!state.playerProfile) return state
      return {
        playerProfile: {
          ...state.playerProfile,
          playableBalance: playable,
          withdrawableBalance: withdrawable,
        },
      }
    })
  },

  updateMultiplier: (multiplier) => {
    set((state) => {
      if (!state.playerProfile) return state
      return {
        playerProfile: {
          ...state.playerProfile,
          currentMultiplier: multiplier,
        },
      }
    })
  },

  linkDebitCard: (last4) => {
    set((state) => {
      if (!state.playerProfile) return state
      return {
        playerProfile: {
          ...state.playerProfile,
          debitCardLinked: true,
          debitCardLast4: last4,
        },
      }
    })
  },

  claimSignupBonus: () => {
    set((state) => {
      if (!state.playerProfile || state.playerProfile.hasClaimedSignupBonus) {
        return state
      }
      return {
        playerProfile: {
          ...state.playerProfile,
          hasClaimedSignupBonus: true,
          playableBalance: '300000000000000000000',
        },
      }
    })
  },

  withdrawFunds: async (amount, cardLast4) => {
    const state = get()
    if (!state.playerProfile) return false

    const amountBigInt = BigInt(amount)
    const withdrawableBigInt = BigInt(state.playerProfile.withdrawableBalance)
    const playableBigInt = BigInt(state.playerProfile.playableBalance)

    // Check if amount meets 2x minimum
    if (playableBigInt < amountBigInt * BigInt(2)) {
      console.error('Must win 2x the withdrawal amount')
      return false
    }

    // Check if amount is available in withdrawable balance
    if (withdrawableBigInt < amountBigInt) {
      console.error('Insufficient withdrawable balance')
      return false
    }

    // Check if debit card is linked
    if (!state.playerProfile.debitCardLinked || state.playerProfile.debitCardLast4 !== cardLast4) {
      console.error('Debit card not linked')
      return false
    }

    try {
      // Process withdrawal through backend
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: state.playerProfile.address,
          amount,
          cardLast4,
        }),
      })

      if (response.ok) {
        // Update balances
        set((state) => {
          if (!state.playerProfile) return state
          return {
            playerProfile: {
              ...state.playerProfile,
              playableBalance: (playableBigInt - amountBigInt).toString(),
              withdrawableBalance: (withdrawableBigInt - amountBigInt).toString(),
              currentMultiplier: 0, // Reset multiplier after withdrawal
            },
          }
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Withdrawal error:', error)
      return false
    }
  },
}))
