import {BToast} from 'bootstrap-vue'

export const state = () => ({})


export const actions = {
  async buyTree(params = 0) {
    let self = this;
    let account = this.$cookies.get('account');
    this.$web3.currentProvider.enable();

    const tx = this.$IncrementalSell.methods.buyTree(params.value);
    const data = tx.encodeABI();
    try {
      const receipt = await this.$web3.eth.sendTransaction({
        from: account,
        to: process.env.incrementalSellAddress,
        value: params.value,
        data: data
      }).on('transactionHash', (transactionHash) => {
        let bootStrapToaster = new BToast();
        bootStrapToaster.$bvToast.toast(['Check progress on Etherscan'], {
          toaster: 'b-toaster-bottom-left',
          title: 'Processing transaction...',
          variant: 'warning',
          href: `${process.env.etherScanUrl}/txsPending`,
          bodyClass: 'bid error',
          noAutoHide: true

        })
      })
        .on('error', (error) => {
          console.log(error, "errorr");
          const bootStrapToaster = new BToast();
          if (error.code === 32602) {
            bootStrapToaster.$bvToast.toast(['You don\'t have enough Ether (ETH)'], {
              toaster: 'b-toaster-bottom-left',
              title: 'Transaction failed',
              variant: 'danger',
              noAutoHide: true,
              bodyClass: 'fund-error'
            })
          } else {
            bootStrapToaster.$bvToast.toast([error.message], {
              toaster: 'b-toaster-bottom-left',
              title: 'Transaction failed',
              variant: 'danger',
              noAutoHide: true,
              bodyClass: 'fund-error'
            })
          }
          return null

        })
      console.log(receipt, "receipt")
      return receipt

    } catch (error) {
      console.log(error, "errorr");

      return null;
    }

  },

}

export const mutations = {}
