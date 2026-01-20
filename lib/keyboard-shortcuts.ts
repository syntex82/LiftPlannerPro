/**
 * Keyboard Shortcuts for CAD Editor
 * Professional CAD software keyboard shortcuts
 */

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  command: string
  description: string
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // File Operations
  { key: 'S', ctrl: true, command: 'save', description: 'Save drawing' },
  { key: 'N', ctrl: true, command: 'new', description: 'New drawing' },
  { key: 'O', ctrl: true, command: 'open', description: 'Open drawing' },
  { key: 'E', ctrl: true, command: 'export', description: 'Export drawing' },
  { key: 'P', ctrl: true, command: 'print', description: 'Print drawing' },

  // Edit Operations
  { key: 'Z', ctrl: true, command: 'undo', description: 'Undo' },
  { key: 'Y', ctrl: true, command: 'redo', description: 'Redo' },
  { key: 'X', ctrl: true, command: 'cut', description: 'Cut' },
  { key: 'C', ctrl: true, command: 'copy', description: 'Copy' },
  { key: 'V', ctrl: true, command: 'paste', description: 'Paste' },
  { key: 'A', ctrl: true, command: 'select-all', description: 'Select all' },
  { key: 'Delete', command: 'delete', description: 'Delete selected' },

  // Drawing Tools
  { key: 'L', command: 'line', description: 'Line tool' },
  { key: 'R', command: 'rectangle', description: 'Rectangle tool' },
  { key: 'C', command: 'circle', description: 'Circle tool' },
  { key: 'P', command: 'polyline', description: 'Polyline tool' },
  { key: 'T', command: 'text', description: 'Text tool' },
  { key: 'D', command: 'dimension', description: 'Dimension tool' },
  { key: 'M', command: 'measure', description: 'Measure tool' },

  // Modification Tools
  { key: 'M', shift: true, command: 'mirror', description: 'Mirror' },
  { key: 'O', shift: true, command: 'offset', description: 'Offset' },
  { key: 'A', shift: true, command: 'array', description: 'Array' },
  { key: 'F', shift: true, command: 'fillet', description: 'Fillet' },
  { key: 'H', shift: true, command: 'chamfer', description: 'Chamfer' },

  // View Operations
  { key: 'Z', command: 'zoom-window', description: 'Zoom window' },
  { key: 'Z', shift: true, command: 'zoom-extents', description: 'Zoom extents' },
  { key: 'Z', ctrl: true, command: 'zoom-in', description: 'Zoom in' },
  { key: 'Z', ctrl: true, shift: true, command: 'zoom-out', description: 'Zoom out' },
  { key: 'Home', command: 'zoom-all', description: 'Zoom all' },
  { key: 'Space', command: 'pan', description: 'Pan' },

  // Snap and Grid
  { key: 'G', command: 'toggle-grid', description: 'Toggle grid' },
  { key: 'G', shift: true, command: 'toggle-snap-grid', description: 'Toggle snap to grid' },
  { key: 'S', shift: true, command: 'toggle-snap-objects', description: 'Toggle snap to objects' },

  // Interface
  { key: '`', command: 'command-line', description: 'Open command line' },
  { key: 'F1', command: 'help', description: 'Help' },
  { key: 'Escape', command: 'cancel', description: 'Cancel current operation' },
]

export const getShortcutString = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key)
  return parts.join('+')
}

export const findShortcutByCommand = (command: string): KeyboardShortcut | undefined => {
  return KEYBOARD_SHORTCUTS.find(s => s.command === command)
}

export const findShortcutByKey = (key: string, ctrl: boolean, shift: boolean, alt: boolean): KeyboardShortcut | undefined => {
  return KEYBOARD_SHORTCUTS.find(s =>
    s.key === key &&
    (s.ctrl || false) === ctrl &&
    (s.shift || false) === shift &&
    (s.alt || false) === alt
  )
}

export const handleKeyboardShortcut = (
  event: KeyboardEvent,
  onCommand: (command: string) => void
): boolean => {
  const shortcut = findShortcutByKey(
    event.key.toUpperCase(),
    event.ctrlKey || event.metaKey,
    event.shiftKey,
    event.altKey
  )

  if (shortcut) {
    event.preventDefault()
    onCommand(shortcut.command)
    return true
  }

  return false
}

export const getShortcutsByCategory = (category: string): KeyboardShortcut[] => {
  const categories: { [key: string]: string[] } = {
    'file': ['save', 'new', 'open', 'export', 'print'],
    'edit': ['undo', 'redo', 'cut', 'copy', 'paste', 'select-all', 'delete'],
    'draw': ['line', 'rectangle', 'circle', 'polyline', 'text', 'dimension', 'measure'],
    'modify': ['mirror', 'offset', 'array', 'fillet', 'chamfer'],
    'view': ['zoom-window', 'zoom-extents', 'zoom-in', 'zoom-out', 'zoom-all', 'pan'],
    'snap': ['toggle-grid', 'toggle-snap-grid', 'toggle-snap-objects'],
    'interface': ['command-line', 'help', 'cancel'],
  }

  const commands = categories[category] || []
  return KEYBOARD_SHORTCUTS.filter(s => commands.includes(s.command))
}

