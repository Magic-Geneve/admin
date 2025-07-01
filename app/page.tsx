"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Download, Users, Calculator, Settings } from "lucide-react"

// Types
interface GameFormat {
  id: string
  name: string
  memberPrice: number
  nonMemberPrice: number
  managementPrice: number
}

interface Member {
  id: string
  name: string
}

interface Participant {
  name: string
  isMember: boolean
  format: string
  paymentMethod: "cash" | "twint" | "gestion" | ""
  price: number
}

interface PaymentSummary {
  cash: number
  twint: number
  gestion: number
  membershipCash: number
  membershipTwint: number
  total: number
}

// Liste des membres pré-chargée
const initialMembers: Member[] = [
  { id: "1", name: "Alex G.A" },
  { id: "2", name: "Alexey Paulot" },
  { id: "3", name: "Benjamin Jost" },
  { id: "4", name: "Benjamin Regazzoni" },
  { id: "5", name: "Christophe Hostettler" },
  { id: "6", name: "Clément Baillat" },
  { id: "7", name: "Dario Tabellini" },
  { id: "8", name: "Elliot Grange" },
  { id: "9", name: "Fabrice Jaquet" },
  { id: "10", name: "Gazmend Shabani" },
  { id: "11", name: "Gil Ferrari" },
  { id: "12", name: "Grégoire Kern" },
  { id: "13", name: "Guillaume Baudois" },
  { id: "14", name: "Guillaume Sauvain" },
  { id: "15", name: "Hadrien Filhon" },
  { id: "16", name: "Iacopo A." },
  { id: "17", name: "inti brandup" },
  { id: "18", name: "Ivo Palmeira" },
  { id: "19", name: "John Apostolakis" },
  { id: "20", name: "Juan Cardona" },
  { id: "21", name: "Julien Ferdinand" },
  { id: "22", name: "Léo Felder" },
  { id: "23", name: "Luca Fessia" },
  { id: "24", name: "lucas pio" },
  { id: "25", name: "Lucien Imfeld" },
  { id: "26", name: "Marc Oehler" },
  { id: "27", name: "Marcus Frutiger" },
  { id: "28", name: "mark schwass" },
  { id: "29", name: "Michal Svacha" },
  { id: "30", name: "Miko Miku" },
  { id: "31", name: "Misha Meihsl" },
  { id: "32", name: "Nicolas Casademont" },
  { id: "33", name: "Noé Gassman" },
  { id: "34", name: "Patrick Chhen" },
  { id: "35", name: "Quentin Gn" },
  { id: "36", name: "Rémi Traversi" },
  { id: "37", name: "sam genoud prachex" },
  { id: "38", name: "Santiago Cáceres" },
  { id: "39", name: "Scott Freeman" },
  { id: "40", name: "Sebastien Miche" },
  { id: "41", name: "Thomas Blanchot" },
  { id: "42", name: "Timothée Stalder" },
  { id: "43", name: "yannick chatelle" },
  { id: "44", name: "Yuri Crocci" },
  { id: "45", name: "zacharie jourdain" },
  { id: "46", name: "sam Genoud-prachex" },
  { id: "47", name: "Carlo Ottaviani" },
  { id: "48", name: "Francois Rakotoarison" },
  { id: "49", name: "François Matheys" },
]

// Membres autorisés à utiliser le mode de paiement "gestion"
const managementAuthorizedMembers = [
  "Christophe Hostettler",
  "Elliot Grange",
  "Michal Svacha",
  "François Matheys",
  "Nicolas Casademont",
  "mark schwass",
]

export default function CaisseApp() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>("draft") // Updated default value
  const [participantsList, setParticipantsList] = useState<string>("")
  const [newMemberName, setNewMemberName] = useState<string>("")
  const [gameFormats, setGameFormats] = useState<GameFormat[]>([
    {
      id: "draft",
      name: "Draft",
      memberPrice: 16,
      nonMemberPrice: 19,
      managementPrice: 0,
    },
    {
      id: "modern",
      name: "Modern",
      memberPrice: 12,
      nonMemberPrice: 15,
      managementPrice: 0,
    },
    {
      id: "duel-commander",
      name: "Duel Commander",
      memberPrice: 12,
      nonMemberPrice: 15,
      managementPrice: 0,
    },
    {
      id: "legacy",
      name: "Legacy",
      memberPrice: 12,
      nonMemberPrice: 15,
      managementPrice: 0,
    },
    {
      id: "commander-multi",
      name: "Commander Multi",
      memberPrice: 5,
      nonMemberPrice: 7,
      managementPrice: 0,
    },
    {
      id: "rcq",
      name: "RCQ",
      memberPrice: 25,
      nonMemberPrice: 25,
      managementPrice: 0,
    },
  ])

  const [membershipPopup, setMembershipPopup] = useState<{
    show: boolean
    participantIndex: number
    participantName: string
  } | null>(null)

  const [membershipTransactions, setMembershipTransactions] = useState<
    Array<{
      name: string
      paymentMethod: "cash" | "twint"
      amount: number
    }>
  >([])

  // Ajouter un état pour le popup de vérification des paiements
  const [paymentVerificationPopup, setPaymentVerificationPopup] = useState<boolean>(false)

  const [editingMember, setEditingMember] = useState<{ id: string; name: string } | null>(null)

  // Normaliser les noms pour la comparaison
  const normalizeName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, " ")
  }

  // Vérifier si une personne est membre
  const isMember = (name: string): boolean => {
    const normalizedName = normalizeName(name)
    return members.some((member) => normalizeName(member.name) === normalizedName)
  }

  // Vérifier si un membre est autorisé à utiliser le mode de paiement "gestion"
  const isManagementAuthorized = (name: string): boolean => {
    return managementAuthorizedMembers.some((authorizedName) => normalizeName(authorizedName) === normalizeName(name))
  }

  // Calculer le prix de gestion (tarif membre - nombre d'inscrits)
  const calculateManagementPrice = (memberPrice: number): number => {
    const totalParticipants = participants.length
    const managementPrice = memberPrice - totalParticipants
    return Math.max(0, managementPrice) // Ne pas avoir de prix négatif
  }

  // Ajouter des participants depuis la liste collée
  const addParticipantsFromList = () => {
    if (!selectedFormat || !participantsList.trim()) return

    const format = gameFormats.find((f) => f.id === selectedFormat)
    if (!format) return

    const names = participantsList
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    const newParticipants: Participant[] = names.map((name) => {
      const memberStatus = isMember(name)
      const basePrice = memberStatus ? format.memberPrice : format.nonMemberPrice

      return {
        name,
        isMember: memberStatus,
        format: format.name,
        paymentMethod: "" as any, // Pas de mode de paiement par défaut
        price: basePrice,
      }
    })

    setParticipants((prev) => [...prev, ...newParticipants])
    setParticipantsList("")
  }

  // Supprimer un participant
  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index))
  }

  // Mettre à jour le mode de paiement d'un participant
  const updatePaymentMethod = (index: number, paymentMethod: "cash" | "twint" | "gestion" | "") => {
    const participant = participants[index]

    // Vérifier si le mode "gestion" est autorisé pour ce participant
    if (paymentMethod === "gestion" && (!participant.isMember || !isManagementAuthorized(participant.name))) {
      alert("Le mode de paiement 'gestion' est réservé aux membres autorisés uniquement.")
      return
    }

    // Show membership popup for non-members when payment method is selected (except gestion)
    if (!participant.isMember && paymentMethod !== "" && paymentMethod !== "none" && paymentMethod !== "gestion") {
      setMembershipPopup({
        show: true,
        participantIndex: index,
        participantName: participant.name,
      })
      return
    }

    setParticipants((prev) =>
      prev.map((participant, i) => {
        if (i === index) {
          let price = participant.price

          if (paymentMethod === "cash" || paymentMethod === "twint") {
            const format = gameFormats.find((f) => f.name === participant.format)
            if (format) {
              price = participant.isMember ? format.memberPrice : format.nonMemberPrice
            }
          } else if (paymentMethod === "gestion") {
            const format = gameFormats.find((f) => f.name === participant.format)
            if (format) {
              price = calculateManagementPrice(format.memberPrice)
            }
          }

          return { ...participant, paymentMethod, price }
        }
        return participant
      }),
    )
  }

  // Accept membership offer
  const acceptMembership = (membershipPaymentMethod: "cash" | "twint") => {
    if (!membershipPopup) return

    const { participantIndex, participantName } = membershipPopup

    // Add to members list
    const newMember: Member = {
      id: Date.now().toString(),
      name: participantName,
    }
    setMembers((prev) => [...prev, newMember])

    // Add membership transaction details
    setMembershipTransactions((prev) => [
      ...prev,
      {
        name: participantName,
        paymentMethod: membershipPaymentMethod,
        amount: 30,
      },
    ])

    // Get the original payment method that was selected for the participant
    const originalPaymentMethod = participants[participantIndex]?.paymentMethod || ""

    // Update participant status and payment - keep original payment method
    setParticipants((prev) =>
      prev.map((participant, i) => {
        if (i === participantIndex) {
          const format = gameFormats.find((f) => f.name === participant.format)
          const memberPrice = format ? format.memberPrice : participant.price

          return {
            ...participant,
            isMember: true,
            paymentMethod: originalPaymentMethod, // Keep the original payment method
            price: memberPrice,
          }
        }
        return participant
      }),
    )

    setMembershipPopup(null)
  }

  // Decline membership offer
  const declineMembership = (paymentMethod: "cash" | "twint") => {
    if (!membershipPopup) return

    const { participantIndex } = membershipPopup

    // Just update payment method without membership - keep the original payment method
    setParticipants((prev) =>
      prev.map((participant, i) => {
        if (i === participantIndex) {
          return { ...participant, paymentMethod }
        }
        return participant
      }),
    )

    setMembershipPopup(null)
  }

  // Ajouter un membre
  const addMember = () => {
    if (!newMemberName.trim()) return

    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
    }

    setMembers((prev) => [...prev, newMember])
    setNewMemberName("")
  }

  // Supprimer un membre
  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id))
  }

  // Commencer l'édition d'un membre
  const startEditingMember = (member: Member) => {
    setEditingMember({ id: member.id, name: member.name })
  }

  // Sauvegarder les modifications d'un membre
  const saveEditingMember = () => {
    if (!editingMember) return

    setMembers((prev) =>
      prev.map((member) => (member.id === editingMember.id ? { ...member, name: editingMember.name.trim() } : member)),
    )
    setEditingMember(null)
  }

  // Annuler l'édition d'un membre
  const cancelEditingMember = () => {
    setEditingMember(null)
  }

  // Calculer le résumé des paiements
  const calculatePaymentSummary = (): PaymentSummary => {
    const participantsSummary = participants
      .filter((p) => p.paymentMethod !== "") // Ignorer les participants sans mode de paiement
      .reduce(
        (acc, participant) => {
          acc[
            participant.paymentMethod as keyof Omit<PaymentSummary, "total" | "membershipCash" | "membershipTwint">
          ] += participant.price
          acc.total += participant.price
          return acc
        },
        { cash: 0, twint: 0, gestion: 0, membershipCash: 0, membershipTwint: 0, total: 0 },
      )

    // Ajouter les cotisations par mode de paiement
    const membershipSummary = membershipTransactions.reduce(
      (acc, transaction) => {
        if (transaction.paymentMethod === "cash") {
          acc.membershipCash += transaction.amount
        } else if (transaction.paymentMethod === "twint") {
          acc.membershipTwint += transaction.amount
        }
        acc.total += transaction.amount
        return acc
      },
      { membershipCash: 0, membershipTwint: 0, total: 0 },
    )

    return {
      ...participantsSummary,
      membershipCash: membershipSummary.membershipCash,
      membershipTwint: membershipSummary.membershipTwint,
      total: participantsSummary.total + membershipSummary.total,
    }
  }

  // Modifier la fonction exportToPDF pour vérifier les paiements avant l'export
  const exportToPDF = () => {
    // Vérifier si tous les participants ont un mode de paiement sélectionné
    const participantsWithoutPayment = participants.filter((p) => p.paymentMethod === "" || p.paymentMethod === "none")

    if (participantsWithoutPayment.length > 0) {
      setPaymentVerificationPopup(true)
      return
    }

    // Continuer avec l'export normal si tous les paiements sont sélectionnés
    proceedWithExport()
  }

  // Nouvelle fonction pour effectuer l'export
  const proceedWithExport = () => {
    const summary = calculatePaymentSummary()
    const date = new Date().toLocaleDateString("fr-CH")

    // Créer le contenu HTML pour le PDF
    const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport de Caisse - ${date}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
          .participants { margin: 20px 0; }
          .memberships { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #e8f4f8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport de Caisse</h1>
          <p>Date: ${date}</p>
        </div>
        
        <div class="summary">
          <h2>Résumé des Encaissements</h2>
          <p><strong>Cash:</strong> ${summary.cash.toFixed(2)} CHF</p>
          <p><strong>Twint:</strong> ${summary.twint.toFixed(2)} CHF</p>
          <p><strong>Gestion:</strong> ${summary.gestion.toFixed(2)} CHF</p>
          <p><strong>Cotisations Cash:</strong> ${summary.membershipCash.toFixed(2)} CHF</p>
          <p><strong>Cotisations Twint:</strong> ${summary.membershipTwint.toFixed(2)} CHF</p>
          <p><strong>Total:</strong> ${summary.total.toFixed(2)} CHF</p>
        </div>
        
        <div class="participants">
          <h2>Détail des Participants</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Statut</th>
                <th>Format</th>
                <th>Paiement</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              ${participants
                .map(
                  (p) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.isMember ? "Membre" : "Non-membre"}</td>
                  <td>${p.format}</td>
                  <td>${p.paymentMethod.toUpperCase()}</td>
                  <td>${p.price.toFixed(2)} CHF</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${
          membershipTransactions.length > 0
            ? `
        <div class="memberships">
          <h2>Détail des Cotisations Annuelles</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Mode de Paiement</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${membershipTransactions
                .map(
                  (transaction) => `
                <tr>
                  <td>${transaction.name}</td>
                  <td>${transaction.paymentMethod.toUpperCase()}</td>
                  <td>${transaction.amount.toFixed(2)} CHF</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }
      </body>
    </html>
  `

    // Créer et télécharger le PDF
    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rapport-caisse-${date.replace(/\//g, "-")}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const paymentSummary = calculatePaymentSummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold mb-2">Caisse Magic Genève</h1>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <Tabs defaultValue="caisse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-0 p-1 rounded-xl">
            <TabsTrigger
              value="caisse"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Calculator className="w-4 h-4" />
              Caisse
            </TabsTrigger>
            <TabsTrigger
              value="membres"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Membres
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="caisse" className="space-y-6">
            {/* Sélection du format et ajout de participants */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label className="text-gray-700 font-medium">Format de jeu</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {gameFormats.map((format) => (
                      <div
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                          selectedFormat === format.id
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-2">{format.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Membre:</span>
                            <span className="font-medium text-green-600">{format.memberPrice} CHF</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Non-membre:</span>
                            <span className="font-medium text-orange-600">{format.nonMemberPrice} CHF</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Gestion:</span>
                            <span className="font-medium text-purple-600">
                              {calculateManagementPrice(format.memberPrice)} CHF
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="participants" className="text-gray-700 font-medium">
                    Liste des participants (un par ligne)
                  </Label>
                  <Textarea
                    id="participants"
                    placeholder="Coller la liste des participants ici..."
                    value={participantsList}
                    onChange={(e) => setParticipantsList(e.target.value)}
                    rows={6}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={addParticipantsFromList}
                  disabled={!selectedFormat || !participantsList.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter les Participants
                </Button>
              </CardContent>
            </Card>

            {/* Liste des participants */}
            {participants.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants Enregistrés ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{participant.name}</span>
                            <Badge
                              variant={participant.isMember ? "default" : "secondary"}
                              className={
                                participant.isMember
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-orange-500 hover:bg-orange-600"
                              }
                            >
                              {participant.isMember ? "Membre" : "Non-membre"}
                            </Badge>
                            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                              {participant.format}
                            </Badge>
                            {participant.isMember && isManagementAuthorized(participant.name) && (
                              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                                Gestion autorisée
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Select
                            value={participant.paymentMethod}
                            onValueChange={(value: "cash" | "twint" | "gestion" | "") =>
                              updatePaymentMethod(index, value)
                            }
                          >
                            <SelectTrigger className="w-32 border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Paiement" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-- Choisir --</SelectItem>
                              <SelectItem value="cash">💵 Cash</SelectItem>
                              <SelectItem value="twint">📱 Twint</SelectItem>
                              {participant.isMember && isManagementAuthorized(participant.name) && (
                                <SelectItem value="gestion">🏢 Gestion</SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          <span className="font-bold text-green-600 min-w-[80px] text-right bg-green-50 px-3 py-1 rounded-lg">
                            {participant.price.toFixed(2)} CHF
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeParticipant(index)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Résumé des paiements */}
            {participants.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Résumé des Encaissements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{paymentSummary.cash.toFixed(2)} CHF</div>
                      <div className="text-sm text-blue-700 font-medium">💵 Cash</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{paymentSummary.twint.toFixed(2)} CHF</div>
                      <div className="text-sm text-purple-700 font-medium">📱 Twint</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm">
                      <div className="text-2xl font-bold text-indigo-600">{paymentSummary.gestion.toFixed(2)} CHF</div>
                      <div className="text-sm text-indigo-700 font-medium">🏢 Gestion</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200 shadow-sm">
                      <div className="text-2xl font-bold text-cyan-600">
                        {paymentSummary.membershipCash.toFixed(2)} CHF
                      </div>
                      <div className="text-sm text-cyan-700 font-medium">🎫💵 Cotis. Cash</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200 shadow-sm">
                      <div className="text-2xl font-bold text-pink-600">
                        {paymentSummary.membershipTwint.toFixed(2)} CHF
                      </div>
                      <div className="text-sm text-pink-700 font-medium">🎫📱 Cotis. Twint</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{paymentSummary.total.toFixed(2)} CHF</div>
                      <div className="text-sm text-green-700 font-medium">💰 Total</div>
                    </div>
                  </div>

                  <Button
                    onClick={exportToPDF}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="membres" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 border-b border-gray-200">
                <div className="flex gap-3">
                  <Input
                    placeholder="Nom du nouveau membre"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addMember()}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <Button
                    onClick={addMember}
                    disabled={!newMemberName.trim()}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>

              <CardContent className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {editingMember?.id === member.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingMember.name}
                              onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") saveEditingMember()
                                if (e.key === "Escape") cancelEditingMember()
                              }}
                              className="text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={saveEditingMember}
                              disabled={!editingMember.name.trim()}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 h-9"
                            >
                              ✓ Sauvegarder
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingMember}
                              className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-2 h-9 bg-transparent"
                            >
                              ✕ Annuler
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-900 flex-1">{member.name}</span>
                            {isManagementAuthorized(member.name) && (
                              <Badge
                                variant="outline"
                                className="border-purple-300 text-purple-700 bg-purple-50 text-xs"
                              >
                                Gestion
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      {editingMember?.id !== member.id && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingMember(member)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 px-3 py-2"
                            title="Modifier le membre"
                          >
                            ✏️ Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-3 py-2"
                            title="Supprimer le membre"
                          >
                            🗑️ Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration des Tarifs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {gameFormats.map((format) => (
                    <div
                      key={format.id}
                      className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">{format.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tarif Membre</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="number"
                              value={format.memberPrice}
                              onChange={(e) => {
                                const newPrice = Number.parseFloat(e.target.value) || 0
                                const updatedFormats = gameFormats.map((f) =>
                                  f.id === format.id ? { ...f, memberPrice: newPrice } : f,
                                )
                                setGameFormats(updatedFormats)
                              }}
                              className="w-20 border-green-300 focus:border-green-500 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-500 font-medium">CHF</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tarif Non-membre</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="number"
                              value={format.nonMemberPrice}
                              onChange={(e) => {
                                const newPrice = Number.parseFloat(e.target.value) || 0
                                const updatedFormats = gameFormats.map((f) =>
                                  f.id === format.id ? { ...f, nonMemberPrice: newPrice } : f,
                                )
                                setGameFormats(updatedFormats)
                              }}
                              className="w-20 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-500 font-medium">CHF</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tarif Gestion</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-20 px-3 py-2 bg-purple-50 border border-purple-300 rounded text-center text-sm font-medium text-purple-700">
                              {calculateManagementPrice(format.memberPrice)}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">CHF</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Calculé: {format.memberPrice} - {participants.length} participants
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Membership Popup */}
        {membershipPopup?.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-0">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Proposition d'adhésion</h3>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-900">{membershipPopup.participantName}</strong> n'est pas encore membre.
                </p>
                <p className="text-gray-600">
                  Souhaitez-vous l'ajouter comme membre pour <span className="font-bold text-green-600">30 CHF</span> ?
                  Il bénéficiera ainsi des tarifs préférentiels.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500 text-center mb-4">Choisissez le mode de paiement :</div>

                <div className="space-y-2">
                  <Button
                    onClick={() => acceptMembership("cash")}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                  >
                    ✅ Accepter - Paiement Cash
                  </Button>
                  <Button
                    onClick={() => acceptMembership("twint")}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                  >
                    ✅ Accepter - Paiement Twint
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="text-sm text-gray-500 text-center mb-3">Ou continuer sans adhésion :</div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => declineMembership("cash")}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      ❌ Refuser - Paiement Cash
                    </Button>
                    <Button
                      onClick={() => declineMembership("twint")}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      ❌ Refuser - Paiement Twint
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Verification Popup */}
        {paymentVerificationPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-0">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vérification des Paiements</h3>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">Certains participants n'ont pas de mode de paiement sélectionné.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    {participants.filter((p) => p.paymentMethod === "" || p.paymentMethod === "none").length}{" "}
                    participant(s) sans paiement :
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    {participants
                      .filter((p) => p.paymentMethod === "" || p.paymentMethod === "none")
                      .map((p, index) => (
                        <li key={index}>• {p.name}</li>
                      ))}
                  </ul>
                </div>
                <p className="text-gray-600 text-sm">
                  Voulez-vous continuer l'export sans ces participants ou retourner pour compléter les paiements ?
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setPaymentVerificationPopup(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                >
                  ↩️ Retourner et Compléter les Paiements
                </Button>
                <Button
                  onClick={() => {
                    setPaymentVerificationPopup(false)
                    proceedWithExport()
                  }}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                >
                  📄 Continuer l'Export (Participants incomplets exclus)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
