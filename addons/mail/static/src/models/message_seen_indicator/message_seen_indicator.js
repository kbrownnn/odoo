/** @odoo-module **/

import { registerNewModel } from '@mail/model/model_core';
import { attr, many2many, many2one, one2many } from '@mail/model/model_field';
import { insert, replace, unlinkAll } from '@mail/model/model_field_command';

function factory(dependencies) {

    class MessageSeenIndicator extends dependencies['mail.model'] {

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        /**
         * @static
         * @param {mail.thread} [channel] the concerned thread
         */
        static recomputeFetchedValues(channel = undefined) {
            const indicatorFindFunction = channel ? localIndicator => localIndicator.thread === channel : undefined;
            const indicators = this.messaging.models['mail.message_seen_indicator'].all(indicatorFindFunction);
            for (const indicator of indicators) {
                indicator.update({
                    hasEveryoneFetched: indicator._computeHasEveryoneFetched(),
                    hasSomeoneFetched: indicator._computeHasSomeoneFetched(),
                    partnersThatHaveFetched: indicator._computePartnersThatHaveFetched(),
                });
            }
        }

        /**
         * @static
         * @param {mail.thread} [channel] the concerned thread
         */
        static recomputeSeenValues(channel = undefined) {
            const indicatorFindFunction = channel ? localIndicator => localIndicator.thread === channel : undefined;
            const indicators = this.messaging.models['mail.message_seen_indicator'].all(indicatorFindFunction);
            for (const indicator of indicators) {
                indicator.update({
                    hasEveryoneSeen: indicator._computeHasEveryoneSeen(),
                    hasSomeoneFetched: indicator._computeHasSomeoneFetched(),
                    hasSomeoneSeen: indicator._computeHasSomeoneSeen(),
                    isMessagePreviousToLastCurrentPartnerMessageSeenByEveryone:
                        indicator._computeIsMessagePreviousToLastCurrentPartnerMessageSeenByEveryone(),
                    partnersThatHaveFetched: indicator._computePartnersThatHaveFetched(),
                    partnersThatHaveSeen: indicator._computePartnersThatHaveSeen(),
                });
            }
        }

        //----------------------------------------------------------------------
        // Private
        //----------------------------------------------------------------------

        /**
         * @override
         */
        static _createRecordLocalId(data) {
            const { channelId, messageId } = data;
            return `${this.modelName}_${channelId}_${messageId}`;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {boolean}
         * @see computeFetchedValues
         * @see computeSeenValues
         */
        _computeHasEveryoneFetched() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return false;
            }
            const otherPartnerSeenInfosDidNotFetch =
                this.thread.partnerSeenInfos.filter(partnerSeenInfo =>
                    partnerSeenInfo.partner !== this.message.author &&
                    (
                        !partnerSeenInfo.lastFetchedMessage ||
                        partnerSeenInfo.lastFetchedMessage.id < this.message.id
                    )
            );
            return otherPartnerSeenInfosDidNotFetch.length === 0;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {boolean}
         * @see computeSeenValues
         */
        _computeHasEveryoneSeen() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return false;
            }
            const otherPartnerSeenInfosDidNotSee =
                this.thread.partnerSeenInfos.filter(partnerSeenInfo =>
                    partnerSeenInfo.partner !== this.message.author &&
                    (
                        !partnerSeenInfo.lastSeenMessage ||
                        partnerSeenInfo.lastSeenMessage.id < this.message.id
                    )
            );
            return otherPartnerSeenInfosDidNotSee.length === 0;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {boolean}
         * @see computeFetchedValues
         * @see computeSeenValues
         */
        _computeHasSomeoneFetched() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return false;
            }
            const otherPartnerSeenInfosFetched =
                this.thread.partnerSeenInfos.filter(partnerSeenInfo =>
                    partnerSeenInfo.partner !== this.message.author &&
                    partnerSeenInfo.lastFetchedMessage &&
                    partnerSeenInfo.lastFetchedMessage.id >= this.message.id
            );
            return otherPartnerSeenInfosFetched.length > 0;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {boolean}
         * @see computeSeenValues
         */
        _computeHasSomeoneSeen() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return false;
            }
            const otherPartnerSeenInfosSeen =
                this.thread.partnerSeenInfos.filter(partnerSeenInfo =>
                    partnerSeenInfo.partner !== this.message.author &&
                    partnerSeenInfo.lastSeenMessage &&
                    partnerSeenInfo.lastSeenMessage.id >= this.message.id
            );
            return otherPartnerSeenInfosSeen.length > 0;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {boolean}
         * @see computeSeenValues
         */
        _computeIsMessagePreviousToLastCurrentPartnerMessageSeenByEveryone() {
            if (
                !this.message ||
                !this.thread ||
                !this.thread.lastCurrentPartnerMessageSeenByEveryone
            ) {
                return false;
            }
            return this.message.id < this.thread.lastCurrentPartnerMessageSeenByEveryone.id;
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {mail.partner[]}
         * @see computeFetchedValues
         * @see computeSeenValues
         */
        _computePartnersThatHaveFetched() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return unlinkAll();
            }
            const otherPartnersThatHaveFetched = this.thread.partnerSeenInfos
                .filter(partnerSeenInfo =>
                    /**
                     * Relation may not be set yet immediately
                     * @see mail.thread_partner_seen_info:partnerId field
                     * FIXME task-2278551
                     */
                    partnerSeenInfo.partner &&
                    partnerSeenInfo.partner !== this.message.author &&
                    partnerSeenInfo.lastFetchedMessage &&
                    partnerSeenInfo.lastFetchedMessage.id >= this.message.id
                )
                .map(partnerSeenInfo => partnerSeenInfo.partner);
            if (otherPartnersThatHaveFetched.length === 0) {
                return unlinkAll();
            }
            return replace(otherPartnersThatHaveFetched);
        }

        /**
         * Manually called as not always called when necessary
         *
         * @private
         * @returns {mail.partner[]}
         * @see computeSeenValues
         */
        _computePartnersThatHaveSeen() {
            if (!this.message || !this.thread || !this.thread.partnerSeenInfos) {
                return unlinkAll();
            }
            const otherPartnersThatHaveSeen = this.thread.partnerSeenInfos
                .filter(partnerSeenInfo =>
                    /**
                     * Relation may not be set yet immediately
                     * @see mail.thread_partner_seen_info:partnerId field
                     * FIXME task-2278551
                     */
                    partnerSeenInfo.partner &&
                    partnerSeenInfo.partner !== this.message.author &&
                    partnerSeenInfo.lastSeenMessage &&
                    partnerSeenInfo.lastSeenMessage.id >= this.message.id)
                .map(partnerSeenInfo => partnerSeenInfo.partner);
            if (otherPartnersThatHaveSeen.length === 0) {
                return unlinkAll();
            }
            return replace(otherPartnersThatHaveSeen);
        }

        /**
         * @private
         * @returns {mail.message}
         */
        _computeMessage() {
            return insert({ id: this.messageId });
        }

        /**
         * @private
         * @returns {mail.thread}
         */
        _computeThread() {
            return insert({
                id: this.channelId,
                model: 'mail.channel',
            });
        }
    }

    MessageSeenIndicator.modelName = 'mail.message_seen_indicator';

    MessageSeenIndicator.fields = {
        /**
         * The id of the channel this seen indicator is related to.
         *
         * Should write on this field to set relation between the channel and
         * this seen indicator, not on `thread`.
         *
         * Reason for not setting the relation directly is the necessity to
         * uniquely identify a seen indicator based on channel and message from data.
         * Relational data are list of commands, which is problematic to deduce
         * identifying records.
         *
         * TODO: task-2322536 (normalize relational data) & task-2323665
         * (required fields) should improve and let us just use the relational
         * fields.
         */
        channelId: attr({
            required: true,
        }),
        hasEveryoneFetched: attr({
            compute: '_computeHasEveryoneFetched',
            default: false,
        }),
        hasEveryoneSeen: attr({
            compute: '_computeHasEveryoneSeen',
            default: false,
        }),
        hasSomeoneFetched: attr({
            compute: '_computeHasSomeoneFetched',
            default: false,
        }),
        hasSomeoneSeen: attr({
            compute: '_computeHasSomeoneSeen',
            default: false,
        }),
        id: attr(),
        isMessagePreviousToLastCurrentPartnerMessageSeenByEveryone: attr({
            compute: '_computeIsMessagePreviousToLastCurrentPartnerMessageSeenByEveryone',
            default: false,
        }),
        /**
         * The message concerned by this seen indicator.
         * This is automatically computed based on messageId field.
         * @see messageId
         */
        message: many2one('mail.message', {
            compute: '_computeMessage',
        }),
        /**
         * The id of the message this seen indicator is related to.
         *
         * Should write on this field to set relation between the channel and
         * this seen indicator, not on `message`.
         *
         * Reason for not setting the relation directly is the necessity to
         * uniquely identify a seen indicator based on channel and message from data.
         * Relational data are list of commands, which is problematic to deduce
         * identifying records.
         *
         * TODO: task-2322536 (normalize relational data) & task-2323665
         * (required fields) should improve and let us just use the relational
         * fields.
         */
        messageId: attr({
            required: true,
        }),
        partnersThatHaveFetched: many2many('mail.partner', {
            compute: '_computePartnersThatHaveFetched',
        }),
        partnersThatHaveSeen: many2many('mail.partner', {
            compute: '_computePartnersThatHaveSeen',
        }),
        /**
         * The thread concerned by this seen indicator.
         * This is automatically computed based on channelId field.
         * @see channelId
         */
        thread: many2one('mail.thread', {
            compute: '_computeThread',
            inverse: 'messageSeenIndicators'
        }),
    };

    return MessageSeenIndicator;
}

registerNewModel('mail.message_seen_indicator', factory);
