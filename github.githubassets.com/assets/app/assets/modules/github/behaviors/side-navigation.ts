// Deal with selected_link_to on repository and gist pages
function updateSelectedRepoTab(meta: HTMLMetaElement) {
  const selection = meta && meta.getAttribute('value')

  if (!selection) return

  for (const item of document.querySelectorAll('.js-sidenav-container-pjax .js-selected-navigation-item')) {
    const isSelected = (item.getAttribute('data-selected-links') || '').split(' ').indexOf(selection) >= 0
    isSelected ? item.setAttribute('aria-current', 'page') : item.removeAttribute('aria-current')
    item.classList.toggle('selected', isSelected)
  }
}

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLMetaElement)) continue

      if (node.getAttribute('name') === 'selected-link') {
        updateSelectedRepoTab(node)
      }
    }
  }
})

observer.observe(document.head, {childList: true})

// This is to make sure that the selected tab is updated when using back/forward buttons.
document.addEventListener('turbo:load', () => {
  const selectedLink = document.head.querySelector<HTMLMetaElement>('meta[name="selected-link"]')

  if (!selectedLink) return

  updateSelectedRepoTab(selectedLink)
})
