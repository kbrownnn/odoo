/** @odoo-module **/

import { link } from '@mail/model/model_field_command';
import {
    afterEach,
    beforeEach,
    createRootMessagingComponent,
    start,
} from '@mail/utils/test_utils';

QUnit.module('hr_holidays', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('thread_view', {}, function () {
QUnit.module('thread_view_tests.js', {
    beforeEach() {
        beforeEach(this);

        /**
         * @param {mail.thread_view} threadView
         * @param {Object} [otherProps={}]
         */
        this.createThreadViewComponent = async (threadView, otherProps = {}) => {
            const target = this.widget.el;
            const props = Object.assign({ threadViewLocalId: threadView.localId }, otherProps);
            await createRootMessagingComponent(this, "ThreadView", { props, target });
        };

        this.start = async params => {
            const { afterEvent, env, widget } = await start(Object.assign({}, params, {
                data: this.data,
            }));
            this.afterEvent = afterEvent;
            this.env = env;
            this.widget = widget;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('out of office message on direct chat with out of office partner', async function (assert) {
    assert.expect(2);

    // Returning date of the out of office partner, simulates he'll be back in a month
    const returningDate = moment.utc().add(1, 'month');
    // Needed partner & user to allow simulation of message reception
    this.data['res.partner'].records.push({
        id: 11,
        name: "Foreigner partner",
        out_of_office_date_end: returningDate.format("YYYY-MM-DD"),
    });
    this.data['mail.channel'].records = [{
        channel_type: 'chat',
        id: 20,
        members: [this.data.currentPartnerId, 11],
    }];
    await this.start();
    const thread = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 20,
        model: 'mail.channel'
    });
    const threadViewer = this.messaging.models['mail.thread_viewer'].create({
        hasThreadView: true,
        thread: link(thread),
    });
    await this.createThreadViewComponent(threadViewer.threadView, { hasComposer: true });
    assert.containsOnce(
        document.body,
        '.o_ThreadView_outOfOffice',
        "should have an out of office alert on thread view"
    );
    const formattedDate = returningDate.toDate().toLocaleDateString(
        this.messaging.locale.language.replace(/_/g, '-'),
        { day: 'numeric', month: 'short' }
    );
    assert.ok(
        document.querySelector('.o_ThreadView_outOfOffice').textContent.includes(formattedDate),
        "out of office message should mention the returning date"
    );
});

});
});
});
