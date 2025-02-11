export const CLASS_LABELS = ['alchemist', 'barbarian', 'bard', 'champion', 'cleric', 'druid',
  'fighter', 'monk', 'witch', 'wizard', 'rogue', 'ranger', 'sorcerer', 'psychic', 'kineticist',
  'summoner', 'oracle', 'investigator', 'magus', 'swashbuckler', 'thaumaturge']

export const COMMON_ANCESTRIES = ['dwarf', 'elf', 'gnome', 'goblin', 'halfling', 'human', 'leshy',
  'orc']

export const UNCOMMON_ANCESTRIES = ['azarketi', 'catfolk', 'fetchling', 'gnoll', 'grippli',
  'hobgoblin', 'kitsune', 'kobold', 'lizardfolk', 'nagaji', 'ratfolk', 'tengu', 'vanara']

export const RARE_ANCESTRIES = ['android', ' tiefling']

export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 300,
  3: 600,
  4: 1100,
  5: 1900,
  6: 3200,
  7: 5000,
  8: 7500,
  9: 11000,
  10: 16000,
  11: 23000,
  12: 30000,
}

export const DUEL_ALREADY_RESOLVED_TEXT = 'Duel is already resolved.'
export const JOUST_ALREADY_RESOLVED_TEXT = 'Joust is already resolved.'
export const GENERIC_ERROR_TEXT = 'Something has gone wrong. Try again later.'
export const DUEL_SUCCESSFULLY_CANCELLED_TEXT = 'Duel has been successfully cancelled.'
export const JOUST_SUCCESSFULLY_CANCELLED_TEXT = 'Joust has been successfully cancelled.'
export const ALL_PROPOSED_DUELS_CANCELLED_TEXT = 'All your open duels have been cancelled.'
export const CHALLENGED_GM_TEXT = 'You are not allowed to challenge the GM.'
export const INITIATOR_NOT_SUBSCRIBED_TEXT = 'Duel Initiator is not subscribed.'
export const DONOR_NOT_SUBSCRIBED_TEXT = 'Donor is not subscribed.'
export const CHALLENGED_NOT_SUBSCRIBED_TEXT = 'Dueler challenged is not subscribed.'
export const RECIPIENT_NOT_SUBSCRIBED_TEXT = 'Recipient is not subscribed.'
export const SELF_CHALLENGED_TEXT = 'You cannot duel yourself.'
export const SELF_DONOR_TEXT = 'You cannot give to yourself.'
export const INVALID_DUEL_GOLD_TEXT = 'Gold requested must be a positive whole number.'
export const INITIATOR_NOT_ENOUGH_GOLD_TEXT = 'Duel initiator does not have enough gold.'
export const DONOR_NOT_ENOUGH_GOLD_TEXT = 'Donor does not have enough gold available factoring in pending duels.'
export const CHALLENGED_NOT_ENOUGH_GOLD_TEXT = 'Challenged duelist does not have enough gold.'
export const INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT = 'Duelist initiator does not have enough gold available factoring in pending duels'
export const CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT = 'Duelist requested does not have enough gold available factoring in pending duels'
export const ANCESTRY_ALREADY_CHOSEN_TEXT = `You have already chosen an ancestry and may not choose another (for now).`
export const SECONDARY_CLASS_ALREADY_CHOSEN_TEXT = `You have already chosen a secondary class and may not choose another (for now).`
export const LIST_ANCESTRIES_TEMPLATE = `You cannot change your ancestry after choosing one (for now). Here are the available ancestries to choose from: `
export const LIST_CLASSES_TEMPLATE = `You cannot change your class after choosing one (for now). Here are the available classes to choose from: `
export const MAX_REROLLS_REACHED_TEXT = 'You have already challenge fate twice, and may not again.'
export const FIRST_REROLL_TEXT = 'You have challenged fate and rerolled the dice. You may do so only once more.'
export const SECOND_REROLL_TEXT = 'You have challenged fate and rerolled the dice. You may not do so again.'
export const ALREADY_UNSUBBED_TEXT = 'You are already unlabeled. If you still are labeled, please message directly.'
export const SUCCESSFULLY_UNSUBBED_TEXT = 'You have successfully deactivated with @bskyttrpg.bsky.social'
export const SUCCESSFULLY_RESUBBED_TEXT = 'You have successfully reactivated with @bskyttrpg.bsky.social'
export const NOT_DEACTIVATED_TEXT = 'Unable to reactivate a non-existent character.'
export const CHARACTER_IS_ACTIVE_TEXT = 'Unable to reactivate an active character.'
export const NOT_SUBSCRIBED_TEXT = 'In order to participate, please like (the heart) and subscribe to @bskyttrpg.bsky.social to see labels created.'
export const CHARACTER_IS_DEACTIVATED_TEXT = `In order to participate, please reactivate your character '@bskyttrpg.bsky.social resubscribe'`
export const JOUST_CHOICE_ACCEPTED = 'Your joust choice has been accepted.'

export const LIST_COMMANDS_TEXT_P1 = `The list of available commands are as follows:
@bskyttrpg.bsky.social reroll
@bskyttrpg.bsky.social duel {handle of other player} {gold amount}
@bskyttrpg.bsky.social joust {handle of other player} {gold amount}
@bskyttrpg.bsky.social openduels
@bskyttrpg.bsky.social listancestries`
export const LIST_COMMANDS_TEXT_P2 = `Continued:
@bskyttrpg.bsky.social chooseancestry
@bskyttrpg.bsky.social choosesecondclass
@bskyttrpg.bsky.social unsubscribe
@bskyttrpg.bsky.social resubscribe
@bskyttrpg.bsky.social cancelallduels
@bskyttrpg.bsky.social stats`
export const LIST_COMMANDS_TEXT_P3 = `Continued:
@bskyttrpg.bsky.social givegold {handle of other player} {gold amount}`