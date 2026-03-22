import { useState } from 'react';
import CardForm from './CardForm';
import SummaryPanel from './SummaryPanel';
import OrderList from './OrderList';
import { BOARD_LAYOUT } from '../lib/constants';

// Tab definitions
const TABS = {
  FORM: 'form',
  ORDER: 'order',
  SUMMARY: 'summary',
};

/**
 * Sidebar component - contains card form, story order, and summary tabs
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab
 * @param {function} props.onTabChange - Callback when tab changes
 * @param {Object} props.editingCard - Card being edited (null for new card)
 * @param {function} props.onSaveCard - Callback when card is saved
 * @param {function} props.onCancelEdit - Callback when edit is cancelled
 * @param {Array} props.cards - Array of cards for story order view
 * @param {string} props.deckId - Deck UUID for AI summary
 * @param {function} props.onCardClick - Callback when card is clicked in order list
 * @param {function} props.onShuffle - Callback to shuffle cards
 * @param {boolean} props.readOnly - Whether in read-only mode
 * @param {boolean} props.isOpen - Whether sidebar is open (for mobile)
 * @param {function} props.onClose - Callback to close sidebar (for mobile)
 * @param {boolean} props.isMobile - Whether rendered in mobile bottom sheet
 */
function Sidebar({
  activeTab = TABS.FORM,
  onTabChange,
  editingCard = null,
  onSaveCard,
  onCancelEdit,
  cards = [],
  deckId = null,
  onCardClick,
  onShuffle,
  readOnly = false,
  isOpen = true,
  onClose,
  isMobile = false,
}) {
  return (
    <aside
      className={`
        bg-white flex flex-col
        ${isMobile ? 'w-full' : 'border-l border-faint h-full'}
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}
      style={isMobile ? undefined : { width: `${BOARD_LAYOUT.SIDEBAR_WIDTH}px` }}
    >
      {/* Tab navigation */}
      <div className="flex border-b border-faint">
        <TabButton
          active={activeTab === TABS.FORM}
          onClick={() => onTabChange?.(TABS.FORM)}
        >
          {editingCard ? 'Edit Card' : 'New Card'}
        </TabButton>
        <TabButton
          active={activeTab === TABS.ORDER}
          onClick={() => onTabChange?.(TABS.ORDER)}
        >
          Story Order
        </TabButton>
        <TabButton
          active={activeTab === TABS.SUMMARY}
          onClick={() => onTabChange?.(TABS.SUMMARY)}
        >
          Summary
        </TabButton>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === TABS.FORM && (
          <CardForm
            card={editingCard}
            onSave={onSaveCard}
            onCancel={editingCard ? onCancelEdit : undefined}
          />
        )}

        {activeTab === TABS.ORDER && (
          <OrderList
            cards={cards}
            onCardClick={onCardClick}
            onShuffle={onShuffle}
            readOnly={readOnly}
          />
        )}

        {activeTab === TABS.SUMMARY && (
          <SummaryPanel deckId={deckId} cards={cards} />
        )}
      </div>
    </aside>
  );
}

/**
 * Tab button component
 */
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-3 py-3 text-sm font-medium transition-colors
        ${active
          ? 'text-ink border-b-2 border-ink -mb-px'
          : 'text-muted hover:text-ink'
        }
      `}
    >
      {children}
    </button>
  );
}

// Export tabs constant for use in parent components
export { TABS };
export default Sidebar;
