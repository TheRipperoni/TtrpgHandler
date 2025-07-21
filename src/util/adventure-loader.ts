// export async function loadAdventure(
//
// ): Promise<Adventure> {
//   const { subject, charClass, gold, level, experience, status } = opts
//   const newEntry: Character = {
//     ancestry: null,
//     class: charClass,
//     author: subject,
//     gold: gold,
//     level: level,
//     experience: experience,
//     status: status,
//     secondary_class: null,
//   }
//
//   const res = await db.insertInto('character')
//     .values(newEntry)
//     .onConflict((oc) => oc.doNothing())
//     .execute()
//
//   if (!res) {
//     throw new CharacterAlreadyExistsError()
//   }
//   return newEntry
// }

