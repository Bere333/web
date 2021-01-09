import WalletConnect from "walletconnect";
import Web3 from 'web3';
import {
  BToast
} from 'bootstrap-vue'


export const state = () => ({
  token: null,
  toast: false,
  sliceAccount: null,
  index: 0,
  account: null,
  dashboard: false,
  users: null,
  chainId: null,
  trezorPopup: null,
  ledger: null,
  form: null,
  ethPrice: null,
  netWorkName: null,
  leaderBoards: null,
  hasMetaMask: false,
  fortmatic: null,
  connectingWallet: null,
  modalFive: true
})

export const actions = {
  async metaMask({
    commit
  }) {
    let self = this
    await ethereum.enable()
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    const account = accounts[0];
    commit('SET_USER', account)
    self.$cookies.set('account', account)
    console.log(self.state.dashboard, 'self')
    if (self.state.dashboard) {
      await self.$router.push(`forest/${self.$cookies.get('account')}`)
    } else {
      await self.$router.push(`forest/${self.$cookies.get('account')}`)
    }



  },
  async networkNames({
    commit
  }) {
    let bootStrapToaster = new BToast();

    if (process.client) {

      const web3 = window.web3
      let net = null
      let self = this

      function showToast(netName) {
        bootStrapToaster.$bvToast.toast(`You are now on ${netName || 'unknown'} Test Network`, {
          title: `Switched network`,
          href: 'https://blog.treejer.com/tree-funding-and-climate-credit-earning-modules-on-testnet/',
          variant: 'success',
          solid: true,
          toaster: 'b-toaster-bottom-left',
        });
      }
      console.log(web3.version.network, "web3.version")
      const ID = web3.version.network
      const network = await web3.version.getNetwork((err, netId, netName) => {
        console.log(netId, 'netId')
        switch (netId || ID) {
          case "1":
            netName = 'mainnet';
            console.log('This is mainnet')
            break
          case "2":
            console.log('This is the deprecated Morden test network.')
            netName = 'Morden';
            break
          case "3":
            console.log('This is the ropsten test network.')
            netName = 'ropsten';
            break
          case "4":
            console.log('This is the Rinkeby test network.')
            netName = 'Rinkeby';
            break
          case "5":
            console.log('This is the Goerly test network.')
            netName = 'Goerly';
            break
          default:
            console.log('This is an unknown network.')
            netName = 'unknown';
        }
        commit('SET_NET_NAME', netName)
      })
    }

  },
  async walletConnect({
    commit
  }) {
    let self = this
    commit('SET_WALLET', 'walletconnect')
    self.$cookies.set('walletName', 'walletconnect')
    const wc = new WalletConnect();
    const connector = await wc.connect();
    const walletAccount = connector._accounts[0]
    commit('SET_USER', null)
    self.$cookies.set('account', null)
    commit('SET_USER', walletAccount)
    self.$cookies.set('account', walletAccount)
    if (self.state.dashboard) {
      await self.$router.push(`${self.$cookies.get('account')}`)
    } else {
      await self.$router.push(`forest/${self.$cookies.get('account')}`)
    }
    console.log(env, 'walletConnectProjectID')
    const web3Provider = await wc.getWeb3Provider({
      infuraId: process.env.WALLETCONNECT_PROJECT_ID,
    });

    const channelProvider = await wc.getChannelProvider();

  },
  async portis({
    commit
  }) {

    commit('SET_WALLET', 'portis')
    this.$cookies.set('walletName', 'portis')
    if (process.client) {
      const Portis = require("@portis/web3");
      let self = this
      const portis = new Portis(process.env.PORTIS, 'ropsten', {
        scope: ['email']
      });

      const web3OnPortis = new Web3(portis.provider);
      await web3OnPortis.eth.getAccounts((error, accounts) => {
        self.$cookies.set('account', null)
        self.commit('SET_USER', null)
        self.commit('SET_USER', accounts[0])
        self.$cookies.set('account', accounts[0])

        if (self.state.dashboard) {
          self.$router.push(`${self.$cookies.get('account')}`)
        } else {
          self.$router.push(`forest/${self.$cookies.get('account')}`)
        }
      });
      await portis.onLogin(
        (walletAddress) => {
          console.log(walletAddress, "walletAddress walletAddress")
        }
      );

    }
  },
  async fortmatic({
    commit
  }) {
    const Fortmatic = require("fortmatic");
    let self = this
    commit('SET_WALLET', 'fortmatic')
    self.$cookies.set('walletName', 'fortmatic')
    const fm = await new Fortmatic(process.env.FORTMATIC);
    commit('SET_FORTMATIC', fm)
    const web3 = await new Web3(fm.getProvider());
    web3.currentProvider.enable();
    await web3.eth.getAccounts((err, accounts) => {
      let address = accounts[0];
      self.$cookies.set('account', null)
      self.commit('SET_USER', null)
      self.$cookies.set('account', address)
      if (self.state.dashboard) {
        self.$router.push(`${self.$cookies.get('account')}`)
      } else {
        self.$router.push(`forest/${self.$cookies.get('account')}`)
      }
      self.commit('SET_USER', address)
      self.commit('SET_MODAL_FIVE', false)
    });
    // Get user balance (includes ERC20 tokens as well)
    let balances = await fm.user.getBalances();
    let ethBalance = balances.find((e) => {
      // return e.crypto_currency == 'ETH';
    });
  },
  async activeIndex({
    commit
  }, {
    activeIndex
  }) {
    await commit('SET_INDEX', activeIndex)
  },
  async refreshChain() {
    if (process.client) {
      ethereum.autoRefreshOnNetworkChange = false;
      let currentChainId = ethereum.chainId;
    }
  },
  async logout({
    commit
  }) {
    let self = this
    if (this.$cookies.get('walletName') === 'portis') {
      const Portis = require("@portis/web3");
      const portis = await Portis(process.env.PORTIS, 'ropsten')
      portis.logout();
      self.$cookies.set('account', null);
      commit('SET_USER', null)
    }
    if (this.$cookies.get('walletName') === 'metamask') {
      const eth = await ethereum;
      const dc = eth.on('disconnect', (error) => console.log(err, 'err'));
      eth.autoRefreshOnNetworkChange = false
      eth.publicConfigStore._state.isUnlocked = false
      self.$cookies.set('account', null);
      self.commit('SET_USER', null)
      console.log(self.state.account)
      eth.on('chainChanged', handleChainChanged)
      let currentChainId = null
      ethereum.send('eth_chainId')
        .then(handleChainChanged)
        .catch(err => console.error(err)) // This should never happen

      function handleChainChanged(chainId) {

        if (currentChainId !== chainId) {

          currentChainId = chainId
          // Run any other necessary logic...
        }
      }
    }
    await self.$cookies.set('account', null);
    await commit('SET_USER', null)
    await self.$router.push('/')
  },
  hasDashboard({
    commit
  }, {
    status
  }) {
    commit('SET_DASHBOARD', status)
  },
  async ethPrices({
    commit
  }, {
    err
  }) {
    const ethPrice = await this.$axios.$get('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=7WT93YQWFRQAET8AY3GQM6NCIYG6G1YAHE')
    commit('SET_ETH_PRICE', ethPrice.result)
  },
  signUpForm({
    commit
  }) {
    this.$axios.$post('https://api.sg-form.com/signup', {
      email: "iraj.habibzadeh70@gmail.com",
      first_name: "mehdi",
      form_id: "7888deb9-ccb4-11ea-a818-d22e287687ec",
      last_name: "shahi",
      recaptcha: "03AGdBq24_fBLQLout7rX-vkEgXpTIk3F956P8yVoJNdq-4gXDr1X1rzH44WC9OJaLF8bSgfv-4MvGbxFLshHGVZ27dakUm6nKn3CyQ_jZFtaZmTBr7djhKGx15MDNHLjqVOd6hngLRi0Wx3KT8pOr8NijGQwK8yWQrUF9kk0nKlWU7VZ68OZdSqB0eOA9sHTSN48kCGv8gX3qFx4qYlBCcSpUDDNUvk6QvA3zYYRlabJRf5PiJuxupWjsNJ-gv8-bpiEVwumoTWLFDWH83yC-VKV01PKhObB0KG8ilIUkj5MBK9Mo1N0NazYNVrpI_mevoiO4c0OtCpaNFQyTSCfC3MU3ChCBdHQtcHsH08zuHpRJnNFEeibUFj3lQ21vtIyRFQHbkmepnGt2aR47S9Goo4YYydMSZmNxaA",
      user_id: 10211987,
    }).then(res => {
      commit('SET_USERS_FROM', res)
    })
  },
  async getLeaderBoards({
    commit
  }) {
    const leaderBoards = await this.$axios.$get(`${process.env.apiUrl}/trees/leaderboard?perPage=10`)
    commit('SET_LEADERBOARDS', leaderBoards.leaderboard.data)
  }
}

export const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_MODAL_FIVE(state, modalFive) {
    state.modalFive = modalFive
  },
  SET_FORTMATIC(state, fortmatic) {
    state.fortmatic = fortmatic
  },
  SET_WALLET(state, connectingWallet) {
    state.connectingWallet = connectingWallet
  },
  SLICE_ACCOUNT(state, sliceAccount) {
    state.sliceAccount = sliceAccount
  },
  SET_INDEX(state, index) {
    state.index = index
  },
  SET_LEADERBOARDS(state, leaderBoards) {
    state.leaderBoards = leaderBoards
  },
  SET_USER(state, account) {
    state.account = account
  },
  SET_NET_NAME(state, netId) {
    state.netWorkName = netId
  },
  SET_DASHBOARD(state, status) {
    state.dashboard = status
  },
  SET_ETH_PRICE(state, ethPrice) {
    state.ethPrice = ethPrice
  },
  SET_METAMASK(state, metaMask) {
    state.hasMetaMask = metaMask
  },
}
