import React, { useState, useEffect } from "react"

import Medusa from "../services/api"

const useMedusa = (endpoint, query) => {
  const [isLoading, setLoading] = useState(true)
  const [result, setResult] = useState({})

  const subcomponent = Medusa[endpoint]
  if (!subcomponent) {
    throw Error(`Endpoint: "${endpoint}", does not exist`)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      if (!query) {
        if (subcomponent.list) {
          const { data } = await subcomponent.list()
          setResult(data)
          setLoading(false)
        } else {
          const { data } = await subcomponent.retrieve()
          setResult(data)
          setLoading(false)
        }
      } else if (query.id) {
        const { data } = await subcomponent.retrieve(query.id)
        setResult(data)
        setLoading(false)
      } else if (!query.id && query.search) {
        const { data } = await subcomponent.list(query.search)
        setResult(data)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  let value = {
    ...result,
    isLoading,
  }

  if (subcomponent.update && query && query.id) {
    value.update = updateData =>
      subcomponent.update(query.id, updateData).then(({ data }) => {
        setResult(data)
      })
  }

  switch (endpoint) {
    case "store":
      value.update = updateData => {
        return subcomponent.update(updateData).then(({ data }) => {
          setResult(data)
        })
      }
      value.addCurrency = code =>
        subcomponent.addCurrency(code).then(({ data }) => {
          setResult(data)
        })
      value.removeCurrency = code =>
        subcomponent.removeCurrency(code).then(({ data }) => {
          setResult(data)
        })
      break
    case "products":
      if (query && query.id) {
        const variantMethods = {
          create: variant => {
            return subcomponent.variants
              .create(query.id, variant)
              .then(({ data }) => {
                setResult(data)
              })
          },
          retrieve: variantId => {
            return subcomponent.variants
              .retrieve(query.id, variantId)
              .then(({ data }) => {
                setResult(data)
              })
          },
          update: (variantId, update) => {
            return subcomponent.variants
              .update(query.id, variantId, update)
              .then(({ data }) => {
                setResult(data)
              })
          },
          delete: variantId => {
            return subcomponent.variants
              .delete(query.id, variantId)
              .then(({ data }) => {
                setResult(data)
              })
          },
          list: () => {
            return subcomponent.variants.delete(query.id)
          },
        }
        value.variants = variantMethods

        const optionMethods = {
          create: option => {
            return subcomponent.options
              .create(query.id, option)
              .then(({ data }) => {
                setResult(data)
              })
          },
          update: (optionId, update) => {
            return subcomponent.options
              .update(query.id, optionId, update)
              .then(({ data }) => {
                setResult(data)
              })
          },
          delete: optionId => {
            return subcomponent.options
              .delete(query.id, optionId)
              .then(({ data }) => {
                setResult(data)
              })
          },
        }
        value.options = optionMethods
      }
      break
    case "regions":
      value.fulfillmentOptions = subcomponent.fulfillmentOptions
      break
    default:
      break
  }

  return value
}

export default useMedusa
