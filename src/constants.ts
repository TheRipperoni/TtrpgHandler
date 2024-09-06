export const CLASS_LABELS = ['alchemist', 'barbarian', 'bard', 'champion', 'cleric', 'druid',
  'fighter', 'monk', 'witch', 'wizard', 'rogue', 'ranger', 'sorcerer', 'psychic', 'kineticist',
  'summoner', 'oracle', 'investigator', 'magus', 'swashbuckler', 'thaumaturge']

export const COMMON_ANCESTRIES = ['dwarf', 'elf', 'gnome', 'goblin', 'halfling', 'human', 'leshy',
  'orc']

export const UNCOMMON_ANCESTRIES = ['azarketi', 'catfolk', 'fetchling', 'gnoll', 'grippli',
  'hobgoblin', 'kitsune', 'kobold', 'lizardfolk', 'nagaji', 'ratfolk', 'tengu', 'vanara']

export const RARE_ANCESTRIES = ['android', 'tiefling']

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
export const DUEL_ALREADY_RESOLVED_TEXT_BR = 'O duelo já está resolvido.'
export const JOUST_ALREADY_RESOLVED_TEXT = 'Joust is already resolved.'
export const JOUST_ALREADY_RESOLVED_TEXT_BR = 'O Joust já foi resolvido.'
export const GENERIC_ERROR_TEXT = 'Something has gone wrong. Try again later.'
export const GENERIC_ERROR_TEXT_BR = 'Algo deu errado. Tente novamente mais tarde.'
export const DUEL_SUCCESSFULLY_CANCELLED_TEXT = 'Duel has been successfully cancelled.'
export const DUEL_SUCCESSFULLY_CANCELLED_TEXT_BR = 'O duelo foi cancelado com sucesso.'
export const JOUST_SUCCESSFULLY_CANCELLED_TEXT = 'Joust has been successfully cancelled.'
export const JOUST_SUCCESSFULLY_CANCELLED_TEXT_BR = 'O Joust foi cancelado com sucesso.'
export const ALL_PROPOSED_DUELS_CANCELLED_TEXT = 'All your open duels have been cancelled.'
export const ALL_PROPOSED_DUELS_CANCELLED_TEXT_BR = 'Todos os seus duelos abertos foram cancelados.'
export const CHALLENGED_GM_TEXT = 'You are not allowed to challenge the GM.'
export const CHALLENGED_GM_TEXT_BR = 'Você não tem permissão para desafiar o GM.'
export const INITIATOR_NOT_SUBSCRIBED_TEXT = 'Duel Initiator is not subscribed.'
export const INITIATOR_NOT_SUBSCRIBED_TEXT_BR = 'Duel Initiator não está inscrito.'
export const DONOR_NOT_SUBSCRIBED_TEXT = 'Donor is not subscribed.'
export const DONOR_NOT_SUBSCRIBED_TEXT_BR = 'O doador não está inscrito.'
export const CHALLENGED_NOT_SUBSCRIBED_TEXT = 'Dueler challenged is not subscribed.'
export const CHALLENGED_NOT_SUBSCRIBED_TEXT_BR = 'Dueler challenged não é inscrito.'
export const RECIPIENT_NOT_SUBSCRIBED_TEXT = 'Recipient is not subscribed.'
export const RECIPIENT_NOT_SUBSCRIBED_TEXT_BR = 'O destinatário não está inscrito.'
export const SELF_CHALLENGED_TEXT = 'You cannot duel yourself.'
export const SELF_CHALLENGED_TEXT_BR = 'Você não pode duelar com você mesmo.'
export const SELF_DONOR_TEXT = 'You cannot give to yourself.'
export const SELF_DONOR_TEXT_BR = 'Você não pode dar a si mesmo.'
export const INVALID_DUEL_GOLD_TEXT = 'Gold requested must be a positive whole number.'
export const INVALID_DUEL_GOLD_TEXT_BR = 'O ouro solicitado deve ser um número inteiro positivo.'
export const INITIATOR_NOT_ENOUGH_GOLD_TEXT = 'Duel initiator does not have enough gold.'
export const INITIATOR_NOT_ENOUGH_GOLD_TEXT_BR = 'O iniciador do duelo não tem ouro suficiente.'
export const DONOR_NOT_ENOUGH_GOLD_TEXT = 'Donor does not have enough gold available factoring in pending duels.'
export const DONOR_NOT_ENOUGH_GOLD_TEXT_BR = 'O doador não tem ouro suficiente disponível, levando em conta os duelos pendentes.'
export const CHALLENGED_NOT_ENOUGH_GOLD_TEXT = 'Challenged duelist does not have enough gold.'
export const CHALLENGED_NOT_ENOUGH_GOLD_TEXT_BR = 'O duelista desafiado não tem ouro suficiente.'
export const INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT = 'Duelist initiator does not have enough gold available factoring in pending duels'
export const INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT_BR = 'O iniciador do duelista não tem ouro suficiente disponível, levando em conta os duelos pendentes'
export const CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT = 'Duelist requested does not have enough gold available factoring in pending duels'
export const CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT_BR = 'O duelista solicitado não tem ouro suficiente disponível, levando em conta os duelos pendentes'
export const ANCESTRY_ALREADY_CHOSEN_TEXT = `You have already chosen an ancestry and may not choose another (for now).`
export const ANCESTRY_ALREADY_CHOSEN_TEXT_BR = `Você já escolheu uma ascendência e não pode escolher outra (por enquanto).`
export const SECONDARY_CLASS_ALREADY_CHOSEN_TEXT = `You have already chosen a secondary class and may not choose another (for now).`
export const SECONDARY_CLASS_ALREADY_CHOSEN_TEXT_BR = `Você já escolheu uma classe secundária e não pode escolher outra (por enquanto).`
export const LIST_ANCESTRIES_TEMPLATE = `You cannot change your ancestry after choosing one (for now). Here are the available ancestries to choose from: `
export const LIST_ANCESTRIES_TEMPLATE_BR = `Você não pode alterar seu ancestral depois de escolher um (por enquanto). Aqui estão os ancestrais disponíveis para escolha: `
export const LIST_CLASSES_TEMPLATE = `You cannot change your class after choosing one (for now). Here are the available classes to choose from: `
export const LIST_CLASSES_TEMPLATE_BR = `Não é possível alterar sua classe depois de escolher uma (por enquanto). Aqui estão as classes disponíveis para escolha: `
export const MAX_REROLLS_REACHED_TEXT = 'You have already challenge fate twice, and may not again.'
export const MAX_REROLLS_REACHED_TEXT_BR = 'Você já desafiou o destino duas vezes e não poderá fazê-lo novamente.'
export const FIRST_REROLL_TEXT = 'You have challenged fate and rerolled the dice. You may do so only once more.'
export const FIRST_REROLL_TEXT_BR = 'Você desafiou o destino e rolou novamente os dados. Você só pode fazer isso mais uma vez.'
export const SECOND_REROLL_TEXT = 'You have challenged fate and rerolled the dice. You may not do so again.'
export const SECOND_REROLL_TEXT_BR = 'Você desafiou o destino e rolou novamente os dados. Você não pode fazer isso novamente.'
export const ALREADY_UNSUBBED_TEXT = 'You are already unlabeled. If you still are labeled, please message directly.'
export const ALREADY_UNSUBBED_TEXT_BR = 'Você já está sem rótulo. Se você ainda estiver rotulado, envie uma mensagem diretamente.'
export const SUCCESSFULLY_UNSUBBED_TEXT = 'You have successfully deactivated with @bskyttrpg.bsky.social'
export const SUCCESSFULLY_UNSUBBED_TEXT_BR = 'Você desativou com sucesso o @bskyttrpg.bsky.social'
export const SUCCESSFULLY_RESUBBED_TEXT = 'You have successfully reactivated with @bskyttrpg.bsky.social'
export const SUCCESSFULLY_RESUBBED_TEXT_BR = 'Você foi reativado com sucesso com @bskyttrpg.bsky.social'
export const NOT_DEACTIVATED_TEXT = 'Unable to reactivate a non-existent character.'
export const NOT_DEACTIVATED_TEXT_BR = 'Não é possível reativar um personagem inexistente.'
export const CHARACTER_IS_ACTIVE_TEXT = 'Unable to reactivate an active character.'
export const CHARACTER_IS_ACTIVE_TEXT_BR = 'Não é possível reativar um personagem ativo.'
export const NOT_SUBSCRIBED_TEXT = 'In order to participate, please like (the heart) and subscribe to @bskyttrpg.bsky.social to see labels created.'
export const NOT_SUBSCRIBED_TEXT_BR = 'Para participar, curta (o coração) e se inscreva no @bskyttrpg.bsky.social para ver os rótulos criados.'
export const CHARACTER_IS_DEACTIVATED_TEXT = `In order to participate, please reactivate your character '@bskyttrpg.bsky.social resubscribe'`
export const CHARACTER_IS_DEACTIVATED_TEXT_BR = `Para participar, reative seu personagem '@bskyttrpg.bsky.social resubscribe'`
export const JOUST_CHOICE_ACCEPTED = 'Your joust choice has been accepted.'
export const JOUST_CHOICE_ACCEPTED_BR = 'Sua escolha de combate foi aceita.'

export const LIST_COMMANDS_TEXT_P1 = `The list of available commands are as follows:
@bskyttrpg.bsky.social reroll
@bskyttrpg.bsky.social duel {handle of other player} {gold amount}
@bskyttrpg.bsky.social joust {handle of other player} {gold amount}
@bskyttrpg.bsky.social openduels
@bskyttrpg.bsky.social listancestries`
export const LIST_COMMANDS_TEXT_P1_BR = `A lista de comandos disponíveis é a seguinte:
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
export const LIST_COMMANDS_TEXT_P2_BR = `Continuação:
@bskyttrpg.bsky.social chooseancestry
@bskyttrpg.bsky.social choosesecondclass
@bskyttrpg.bsky.social unsubscribe
@bskyttrpg.bsky.social resubscribe
@bskyttrpg.bsky.social cancelallduels
@bskyttrpg.bsky.social stats`
export const LIST_COMMANDS_TEXT_P3 = `Continued:
@bskyttrpg.bsky.social givegold {handle of other player} {gold amount}`
export const LIST_COMMANDS_TEXT_P3_BR = `Continuação:
@bskyttrpg.bsky.social givegold {handle of other player} {gold amount}`