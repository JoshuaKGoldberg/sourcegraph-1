import React, { useEffect, useState } from 'react'
import { Subscription } from 'rxjs'
import { ExtensionsControllerProps } from '../../extensions/controller'
import { applyLinkPreview, ApplyLinkPreviewOptions } from './linkPreviews'

interface Props extends ExtensionsControllerProps, ApplyLinkPreviewOptions {
    /**
     * The HTML content to render (and to which link previews will be added).
     */
    dangerousInnerHTML: string

    /**
     * The "render prop" that is called to render the component with the HTML (after the link
     * previews have been added).
     */
    children: (props: { dangerousInnerHTML: string }) => JSX.Element
}

/**
 * Renders HTML in a component with link previews applied from providers registered with
 * {@link sourcegraph.content.registerLinkPreviewProvider}.
 */
export const WithLinkPreviews: React.FunctionComponent<Props> = props => {
    const [html, setHTML] = useState<string>(props.dangerousInnerHTML)
    useEffect(() => {
        const container = document.createElement('div')
        container.innerHTML = props.dangerousInnerHTML
        setHTML(props.dangerousInnerHTML)

        const subscriptions = new Subscription()
        for (const link of container.querySelectorAll<HTMLAnchorElement>('a[href]')) {
            props.extensionsController.services.linkPreviews.provideLinkPreview(link.href).subscribe(linkPreview => {
                applyLinkPreview(props, link, linkPreview)
                setHTML(container.innerHTML)
            })
        }
        return () => subscriptions.unsubscribe()
    }, [props.dangerousInnerHTML, props.setElementTooltip, props.linkPreviewContentClass])

    return props.children({ dangerousInnerHTML: html })
}
