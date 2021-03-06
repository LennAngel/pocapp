/* global cozy */
import React from 'react'
import DocFrame from './docframe'
import { getFileInvoice } from './helpers'
import { Modal } from 'cozy-ui/react'
import * as Panel from 'cozy-ui/react/Panel'
import logo from '!!file-loader!assets/icons/logo.png'

const { ModalBrandedHeader } = Modal

class IntentHandler extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      text: null,
      intent: null
    }
  }

  componentDidMount () {
    this.startService()
  }

  async startService () {
    let { intentId, text } = this.props

    let service
    let intent
    let docIntent

    try {
      if (intentId) {
        console.log('try to get informations from intent = ', intentId)

        service = await cozy.client.intents.createService(intentId)
        const { bill } = service.getData()
        this.setState({bill})

        intent = service.getIntent()

        if (
          intent.attributes.action === 'SHOW' &&
          intent.attributes.type === 'io.cozy.bills'
        ) {
          const invoice = await getFileInvoice(bill)
          const doctype = invoice[0]
          const id = invoice[1]
          docIntent = cozy.client.intents.create('OPEN', doctype, { id })
        } else {
          text = 'unknow'
        }
      } else {
        text = 'Hello world !'
      }
      this.setState({
        docIntent,
        text,
        intent
      })
    } catch (error) {
      console.log('Got error = ', error)

      service.throw(error)
    }
  }

  handleFileError () {
    console.log('File ERROR')
  }

  handleFileSuccess () {
    console.log('File SUCCESS')
  }

  render () {
    const { docIntent, bill, text } = this.state

    if (docIntent && bill) {
      return (
        <div style='width:100%'>
          <ModalBrandedHeader bg='#f5f6f7' logo={logo} style={{marginBottom: 0}} />
          <Panel.Group style={{height: '100%'}}>
            <Panel.Main style={{padding: 0}}>
              <DocFrame
                intent={docIntent}
                onSuccess={this.handleFileSuccess}
                onError={this.handleFileError} />
            </Panel.Main>
            <Panel.Side>
              <h3>Numéro de sociétaire</h3><p>{bill.maifnumsocietaire}</p>
              <h3>Date d'adhésion</h3><p>{bill.maifdateadhesion}</p>
              <h3>Contacter MAIF</h3><p>{bill.maiftelephone}</p>
            </Panel.Side>
          </Panel.Group>
        </div>
      )
    } else {
      return <h2>{text}</h2>
    }
  }
}

export default IntentHandler
