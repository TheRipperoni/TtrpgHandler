export const LANGUAGES = ['en', 'pt']


export const CLASS_LABELS = ['alchemist', 'barbarian', 'bard', 'champion', 'cleric', 'druid',
  'fighter', 'monk', 'witch', 'wizard', 'rogue', 'ranger', 'sorcerer', 'psychic', 'kineticist',
  'summoner', 'oracle', 'investigator', 'magus', 'swashbuckler', 'thaumaturge']
export const CLASS_LABELS_BR = ['alquimista', 'bárbaro', 'bardo', 'campeão', 'clérigo', 'druida',
  'guerreiro', 'monge', 'bruxa', 'mago', 'ladino', 'patrulheiro', 'feiticeiro', 'psíquico',
  'cineticista',
  'invocador', 'oráculo', 'investigador', 'magus', 'pirata', 'taumaturgo']
export const CLASS_LABELS_LOCALE = { 'en': CLASS_LABELS, 'pt': CLASS_LABELS_BR }

export const COMMON_ANCESTRIES = ['dwarf', 'elf', 'gnome', 'goblin', 'halfling', 'human', 'leshy',
  'orc']
export const COMMON_ANCESTRIES_BR = ['anão', 'elfo', 'gnomo', 'goblin', 'halfling', 'humano',
  'leshy',
  'orc']
export const COMMON_ANCESTRIES_LOCALE = { 'en': COMMON_ANCESTRIES, 'pt': COMMON_ANCESTRIES_BR }

export const UNCOMMON_ANCESTRIES = ['azarketi', 'catfolk', 'fetchling', 'gnoll', 'grippli',
  'hobgoblin', 'kitsune', 'kobold', 'lizardfolk', 'nagaji', 'ratfolk', 'tengu', 'vanara']
export const UNCOMMON_ANCESTRIES_BR = ['azarketi', 'catfolk', 'fetchling', 'gnoll', 'grippli',
  'hobgoblin', 'kitsune', 'kobold', 'lizardfolk', 'nagaji', 'ratfolk', 'tengu', 'vanara']
export const UNCOMMON_ANCESTRIES_LOCALE = { 'en': UNCOMMON_ANCESTRIES, 'pt': UNCOMMON_ANCESTRIES_BR }

export const RARE_ANCESTRIES = ['android', 'tiefling']
export const RARE_ANCESTRIES_BR = ['androide', 'tiefling']
export const RARE_ANCESTRIES_LOCALE = { 'en': RARE_ANCESTRIES, 'pt': RARE_ANCESTRIES_BR }

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

export const SAME_CLASS_TWICE = {
  'en': 'You cannot choose the same class twice.',
  'pt': 'Você não pode escolher a mesma classe duas vezes.',
}
export const DUEL_ALREADY_RESOLVED_TEXT = {
  'en': 'Duel is already resolved.',
  'pt': 'O duelo já está resolvido.',
}
export const JOUST_ALREADY_RESOLVED_TEXT = {
  'en': 'Joust is already resolved.',
  'pt': 'O Joust já foi resolvido.',
}
export const GENERIC_ERROR_TEXT = {
  'en': 'Something has gone wrong. Try again later.',
  'pt': 'Algo deu errado. Tente novamente mais tarde.',
}
export const DUEL_SUCCESSFULLY_CANCELLED_TEXT = {
  'en': 'Duel has been successfully cancelled.',
  'pt': 'O duelo foi cancelado com sucesso.',
}
export const JOUST_SUCCESSFULLY_CANCELLED_TEXT = {
  'en': 'Joust has been successfully cancelled.',
  'pt': 'O Joust foi cancelado com sucesso.',
}
export const ALL_PROPOSED_DUELS_CANCELLED_TEXT = {
  'en': 'All your open duels have been cancelled.',
  'pt': 'Todos os seus duelos abertos foram cancelados.',
}
export const CHALLENGED_GM_TEXT = {
  'en': 'You are not allowed to challenge the GM.',
  'pt': 'Você não tem permissão para desafiar o GM.',
}
export const INITIATOR_NOT_SUBSCRIBED_TEXT = {
  'en': 'Duel Initiator is not subscribed.',
  'pt': 'Duel Initiator não está inscrito.',
}
export const USER_NOT_SUBSCRIBED_TEXT = {
  'en': 'User is not subscribed.',
  'pt': 'User is not subscribed.',
}
export const PARTY_NOT_EXIST_TEXT = {
  'en': 'Party does not exist.',
  'pt': 'Party does not exist.',
}
export const NOT_PARTY_LEADER_TEXT = {
  'en': 'You are not the party leader.',
  'pt': 'You are not the party leader',
}
export const PARTY_SIZE_LIMIT_REACHED_TEXT = {
  'en': 'Party size limit of 4 already reached.',
  'pt': 'Party size limit of 4 already reached.',
}
export const DONOR_NOT_SUBSCRIBED_TEXT = {
  'en': 'Donor is not subscribed.',
  'pt': 'O doador não está inscrito.',
}
export const CHALLENGED_NOT_SUBSCRIBED_TEXT = {
  'en': 'Dueler challenged is not subscribed.',
  'pt': 'Dueler challenged não é inscrito.',
}
export const RECIPIENT_NOT_SUBSCRIBED_TEXT = {
  'en': 'Recipient is not subscribed.',
  'pt': 'O destinatário não está inscrito.',
}
export const SELF_CHALLENGED_TEXT = {
  'en': 'You cannot duel yourself.',
  'pt': 'Você não pode duelar com você mesmo.',
}
export const SELF_DONOR_TEXT = {
  'en': 'You cannot give to yourself.',
  'pt': 'Você não pode dar a si mesmo.',
}
export const INVALID_DUEL_GOLD_TEXT = {
  'en': 'Gold requested must be a positive whole number.',
  'pt': 'O ouro solicitado deve ser um número inteiro positivo.',
}
export const INITIATOR_NOT_ENOUGH_GOLD_TEXT = {
  'en': 'Duel initiator does not have enough gold.',
  'pt': 'O iniciador do duelo não tem ouro suficiente.',
}
export const DONOR_NOT_ENOUGH_GOLD_TEXT = {
  'en': 'Donor does not have enough gold available factoring in pending duels.',
  'pt': 'O doador não tem ouro suficiente disponível, levando em conta os duelos pendentes.',
}
export const CHALLENGED_NOT_ENOUGH_GOLD_TEXT = {
  'en': 'Challenged duelist does not have enough gold.',
  'pt': 'O duelista desafiado não tem ouro suficiente.',
}
export const INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT = {
  'en': 'Duelist initiator does not have enough gold available factoring in pending duels',
  'pt': 'O iniciador do duelista não tem ouro suficiente disponível, levando em conta os duelos pendentes',
}
export const CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT = {
  'en': 'Duelist requested does not have enough gold available factoring in pending duels',
  'pt': 'O duelista solicitado não tem ouro suficiente disponível, levando em conta os duelos pendentes',
}
export const ANCESTRY_ALREADY_CHOSEN_TEXT = {
  'en': `You have already chosen an ancestry and may not choose another (for now).`,
  'pt': `Você já escolheu uma ascendência e não pode escolher outra (por enquanto).`,
}
export const SECONDARY_CLASS_ALREADY_CHOSEN_TEXT = {
  'en': `You have already chosen a secondary class and may not choose another (for now).`,
  'pt': `Você já escolheu uma classe secundária e não pode escolher outra (por enquanto).`,
}
export const LIST_ANCESTRIES_TEMPLATE = {
  'en': `You cannot change your ancestry after choosing one (for now). Here are the available ancestries to choose from: `,
  'pt': `Você não pode alterar seu ancestral depois de escolher um (por enquanto). Aqui estão os ancestrais disponíveis para escolha: `,
}
export const LIST_CLASSES_TEMPLATE = {
  'en': `You cannot change your class after choosing one (for now). Here are the available classes to choose from: `,
  'pt': `Não é possível alterar sua classe depois de escolher uma (por enquanto). Aqui estão as classes disponíveis para escolha: `,
}
export const MAX_REROLLS_REACHED_TEXT = {
  'en': 'You have already challenge fate twice, and may not again.',
  'pt': 'Você já desafiou o destino duas vezes e não poderá fazê-lo novamente.',
}
export const FIRST_REROLL_TEXT = {
  'en': 'You have challenged fate and rerolled the dice. You may do so only once more.',
  'pt': 'Você desafiou o destino e rolou novamente os dados. Você só pode fazer isso mais uma vez.',
}
export const SECOND_REROLL_TEXT = {
  'en': 'You have challenged fate and rerolled the dice. You may not do so again.',
  'pt': 'Você desafiou o destino e rolou novamente os dados. Você não pode fazer isso novamente.',
}
export const ALREADY_UNSUBBED_TEXT = {
  'en': 'You are already unlabeled. If you still are labeled, please message directly.',
  'pt': 'Você já está sem rótulo. Se você ainda estiver rotulado, envie uma mensagem diretamente.',
}
export const SUCCESSFULLY_UNSUBBED_TEXT = {
  'en': 'You have successfully deactivated with @bskyttrpg.bsky.social',
  'pt': 'Você desativou com sucesso o @bskyttrpg.bsky.social',
}
export const SUCCESSFULLY_RESUBBED_TEXT = {
  'en': 'You have successfully reactivated with @bskyttrpg.bsky.social',
  'pt': 'Você foi reativado com sucesso com @bskyttrpg.bsky.social',
}
export const NOT_DEACTIVATED_TEXT = {
  'en': 'Unable to reactivate a non-existent character.',
  'pt': 'Não é possível reativar um personagem inexistente.',
}
export const CHARACTER_IS_ACTIVE_TEXT = {
  'en': 'Unable to reactivate an active character.',
  'pt': 'Não é possível reativar um personagem ativo.',
}
export const NOT_SUBSCRIBED_TEXT = {
  'en': 'In order to participate, please like (the heart) and subscribe to @bskyttrpg.bsky.social to see labels created.',
  'pt': 'Para participar, curta (o coração) e se inscreva no @bskyttrpg.bsky.social para ver os rótulos criados.',
}
export const CHARACTER_IS_DEACTIVATED_TEXT = {
  'en': `In order to participate, please reactivate your character '@bskyttrpg.bsky.social resubscribe'`,
  'pt': `Para participar, reative seu personagem '@bskyttrpg.bsky.social resubscribe'`,
}
export const JOUST_CHOICE_ACCEPTED = {
  'en': 'Your joust choice has been accepted.',
  'pt': 'Sua escolha de combate foi aceita.',
}
export const DONATION_SUCCESSFUL = {
  'en': `Gold has been successfully donated.`,
  'pt': 'O ouro foi doado com sucesso.',
}
export const PARTY_CREATED_SUCCESSFUL = {
  'en': `Party has been successfully created.`,
  'pt': 'O grupo foi criado com sucesso.',
}
//TODO
export const PARTY_INVITE_SUCCESSFUL = {
  'en': `Party has been successfully created.`,
  'pt': 'O grupo foi criado com sucesso.',
}
//TODO
export const PARTY_ACCEPT_SUCCESSFUL = {
  'en': `Party has been successfully created.`,
  'pt': 'O grupo foi criado com sucesso.',
}
//TODO
export const PARTY_REJECT_SUCCESSFUL = {
  'en': `Party has been successfully created.`,
  'pt': 'O grupo foi criado com sucesso.',
}
export const DONATION_ERROR = {
  'en': 'Something has gone wrong donating gold, please reach out to @ripperoni.com',
  'pt': 'Algo deu errado ao doar ouro, entre em contato com @ripperoni.com',
}
export const CREATE_PARTY_ERROR = {
  'en': 'Something has gone wrong creating the party, please reach out to @ripperoni.com',
  'pt': 'Something has gone wrong creating the party, please reach out to @ripperoni.com',
}
export const LIST_COMMANDS_ERROR = {
  'en': 'Unexpected error encountered',
  'pt': 'Erro inesperado encontrado',
}
export const LIST_ANCESTRIES_UNEXPECTED_ERROR = {
  'en': 'Unexpected error encountered',
  'pt': 'Erro inesperado encontrado',
}
export const LIST_ANCESTRIES_ADDITIONAL_OPTIONS = {
  'en': 'Additional options: ',
  'pt': 'Opções adicionais: '
}
export const UNEXPECTED_ERROR = {
  'en': 'Unexpected error encountered',
  'pt': 'Erro inesperado encontrado'
}
export const NO_OPEN_DUELS = {
  'en': 'You have no open duels at the moment.',
  'pt': 'Você não tem duelos abertos no momento.'
}
export const JOUST_NEXT_STEPS = {
  'en': 'Both players should receive a DM from this account, follow instructions there for the next step.',
  'pt': 'Ambos os jogadores devem receber uma mensagem dessa conta; siga as instruções para a próxima etapa.'
}
export const DUEL_INITIATED = {
  'en': 'Duel has been initiated. Challenged player please reply either "Accept" or "Reject" after approximately 10 seconds. Duel Initiator may also reply "Reject" to cancel.',
  'pt': 'O duelo foi iniciado. O jogador desafiado deve responder \"Accept\" (Aceitar) ou \"Reject\" (Rejeitar) após aproximadamente 10 segundos. O iniciador do duelo também pode responder \"Rejeitar\" para cancelar.'
}
export const PARTY_INVITE_CREATED = {
  'en': 'Invite to join party has been initiated. Invited player please reply either "Accept" or "Reject" after approximately 10 seconds. Inviter may also reply "Reject" to cancel.',
  'pt': 'Invite to join party has been initiated. Invited player please reply either "Accept" or "Reject" after approximately 10 seconds. Inviter may also reply "Reject" to cancel.'
}
export const PARTY_INVITE_ACCEPTED_TEXT = {
  'en': 'You have successfully joined the questing party!',
  'pt': 'You have successfully joined the questing party!'
}
export const JOUST_INITIATED = {
  'en': 'Joust has been initiated. Challenged player please reply either \"Accept\" or \"Reject\" after approximately 10 seconds. Joust Initiator may also reply \"Reject\" to cancel. DMs must be open to this bot in order to joust.',
  'pt': 'A disputa foi iniciada. O jogador desafiado deve responder \"Accept\" (Aceitar) ou \"Reject\" (Rejeitar) após aproximadamente 10 segundos. O iniciador da disputa também pode responder \"Reject\" (Rejeitar) para cancelar. Os DMs devem estar abertos a esse bot para que a disputa seja iniciada.'
}
export const JOUST_ERROR = {
  'en': 'Something has gone wrong creating the joust, please reach out to @ripperoni.com',
  'pt': 'Algo deu errado ao criar a competição, entre em contato com @ripperoni.com'
}
export const DUEL_ERROR = {
  'en': 'Something has gone wrong creating the duel, please reach out to @ripperoni.com',
  'pt': 'Algo deu errado ao criar o duelo, entre em contato com @ripperoni.com'
}
export const INVITE_ERROR = {
  'en': 'Something has gone wrong creating the party invite, please reach out to @ripperoni.com',
  'pt': 'Something has gone wrong creating the party invite, please reach out to @ripperoni.com'
}
export const ACCEPT_DUELIST_NO_CHARACTER = {
  'en': 'Duelist Initiator does not have a character',
  'pt': 'O Duelist Initiator não tem um personagem'
}
export const ACCEPT_PARTY_INVITE_NO_CHARACTER = {
  'en': 'Party invite acceptor does not have a character',
  'pt': 'Party invite acceptor does not have a character'
}
export const ACCEPT_RECIPIENT_NO_CHARACTER = {
  'en': 'Duelist Acceptor does not have a character',
  'pt': 'O destinatário do duelo não tem um personagem'
}
export const DUEL_WINNER = {
  'en': 'The winner is ',
  'pt': 'O vencedor é '
}

export const GET_STATS_P1 = {
  'en': `Your current stats`,
  'pt': 'Suas estatísticas atuais'
}
export const LIST_COMMANDS_TEXT_P1 = {
  'en': `The list of available commands are as follows:
@bskyttrpg.bsky.social reroll
@bskyttrpg.bsky.social duel {handle of other player} {gold amount}
@bskyttrpg.bsky.social joust {handle of other player} {gold amount}
@bskyttrpg.bsky.social openduels
@bskyttrpg.bsky.social listancestries`,
  'pt': `A lista de comandos disponíveis é a seguinte:
@bskyttrpg.bsky.social reroll
@bskyttrpg.bsky.social duel {handle of other player} {gold amount}
@bskyttrpg.bsky.social joust {handle of other player} {gold amount}
@bskyttrpg.bsky.social openduels
@bskyttrpg.bsky.social listancestries`,
}
export const LIST_COMMANDS_TEXT_P2 = {
  'en': `Continued:
@bskyttrpg.bsky.social chooseancestry
@bskyttrpg.bsky.social choosesecondclass
@bskyttrpg.bsky.social unsubscribe
@bskyttrpg.bsky.social resubscribe
@bskyttrpg.bsky.social cancelallduels
@bskyttrpg.bsky.social stats`,
  'pt': `Continuação:
@bskyttrpg.bsky.social chooseancestry
@bskyttrpg.bsky.social choosesecondclass
@bskyttrpg.bsky.social unsubscribe
@bskyttrpg.bsky.social resubscribe
@bskyttrpg.bsky.social cancelallduels
@bskyttrpg.bsky.social stats`,
}
export const LIST_COMMANDS_TEXT_P3 = {
  'en': `Continued:
@bskyttrpg.bsky.social givegold {handle of other player} {gold amount}`,
  'pt': `Continuação:
@bskyttrpg.bsky.social givegold {handle of other player} {gold amount}`,
}